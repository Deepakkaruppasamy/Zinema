import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, LifeBuoy } from 'lucide-react';
import { api, assistantChat, buildUserMessage } from '../lib/api.js';
import { useUser } from '@clerk/clerk-react';

const FAQS = [
  { q: 'How do I book a ticket?', a: 'Go to the movie page, select your showtime and seats, and follow the checkout process.' },
  { q: 'How do I get a refund?', a: 'Refunds are available for cancellations made at least 2 hours before the showtime. Visit My Bookings to cancel.' },
  { q: 'Can I change my seat?', a: 'Seat changes are not supported after booking. Please cancel and rebook if needed.' },
  { q: 'How do I contact support?', a: 'You can use this chat or email us at support@zinema.com.' },
];

const BOT_NAME = 'Zinema Bot';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! 👋 How can I help you today? You can ask about bookings, refunds, or anything else.' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'support'
  const { user } = useUser();

  // Support form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Help with my booking');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    const conversation = [...messages, userMsg].map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', text: m.text }));
    setInput('');
    setTyping(true);
    try {
      const resp = await assistantChat(conversation, { name: user?.fullName || undefined, email: user?.primaryEmailAddress?.emailAddress || undefined });
      const botText = resp?.text || "I'm sorry, I couldn't process that.";
      setMessages(msgs => [...msgs, { from: 'bot', text: botText }]);
      // Handle navigation intent
      if (resp?.nav?.target) {
        setTimeout(() => { window.location.href = resp.nav.target; }, 600);
      }
      // Surface quick actions when movies list is present
      const movies = resp?.data?.movies;
      if (Array.isArray(movies) && movies.length > 0) {
        const list = movies.slice(0, 5).map(m => m.title).filter(Boolean).join(', ');
        setMessages(msgs => [...msgs, { from: 'bot', text: `Quick picks: ${list}. You can say "Tell me about [Movie]" or "Book tickets for [Movie]".` }]);
      }
      // Booking suggestion CTA
      if (resp?.intent === 'book_tickets' && resp?.data?.showId) {
        const showId = resp.data.showId;
        const movieTitle = resp?.data?.movie?.title || 'your movie';
        const movieId = resp?.data?.movie?._id;
        const dateStr = new Date(resp?.data?.showDateTime).toISOString().split('T')[0];
        const deepLink = movieId ? `/movies/${movieId}/${dateStr}?showId=${showId}` : `/booking?showId=${showId}`;
        setMessages(msgs => [...msgs, { from: 'bot', text: `Proceed to seat selection for ${movieTitle}? Click: ${deepLink}` }]);
      }
    } catch (e) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Sorry, the assistant is unavailable right now.' }]);
    } finally {
      setTyping(false);
    }
  };

  const getBotReply = (msg) => {
    // Simple keyword/rule-based bot
    const lower = msg.toLowerCase();
    for (const faq of FAQS) {
      if (lower.includes(faq.q.split(' ')[2])) return faq.a;
    }
    if (lower.includes('hello') || lower.includes('hi')) return 'Hello! How can I assist you today?';
    if (lower.includes('refund')) return FAQS[1].a;
    if (lower.includes('seat')) return FAQS[2].a;
    if (lower.includes('support')) return FAQS[3].a;
    if (lower.includes('book')) return FAQS[0].a;
    return "I'm sorry, I didn't understand that. Please try rephrasing or ask about bookings, refunds, or support.";
  };

  useEffect(() => {
    // Prefill support form from Clerk user
    if (user) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      setName(fullName || name);
      const primaryEmail = user.emailAddresses?.[0]?.emailAddress;
      if (primaryEmail && !email) setEmail(primaryEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submitTicket = async () => {
    if (!message.trim()) return;
    try {
      setSubmitting(true);
      await api.post('/api/support/ticket', {
        name: name || 'Guest',
        email,
        subject: subject || 'Support Request',
        message,
      });
      // Clear after submit and give feedback in chat stream
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Thanks! Your support request has been submitted. Our team will get back to you via email shortly.' }]);
      setActiveTab('chat');
      setMessage('');
    } catch (e) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Sorry, we could not submit your request right now. Please try again later or email support.' }]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={`fixed z-50 bottom-6 right-6 ${open ? 'hidden' : ''}`}>
        <button
          className="bg-primary rounded-full p-4 shadow-lg hover:bg-primary-dull transition flex items-center justify-center"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      </div>
      {open && (
        <div className="fixed z-50 bottom-6 right-6 w-80 max-w-xs bg-gray-900 rounded-xl shadow-2xl flex flex-col border border-primary animate-fadeIn">
          <div className="flex items-center justify-between p-4 border-b border-primary bg-primary/10 rounded-t-xl">
            <span className="font-bold text-primary flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Zinema Chat
            </span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex text-xs">
            <button className={`flex-1 py-2 border-b ${activeTab==='chat' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`} onClick={()=>setActiveTab('chat')}>Chat</button>
            <button className={`flex-1 py-2 border-b ${activeTab==='support' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`} onClick={()=>setActiveTab('support')}><span className="inline-flex items-center gap-1"><LifeBuoy className="w-3.5 h-3.5"/>Support</span></button>
          </div>

          {activeTab === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-900" style={{ maxHeight: 320 }}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.from === 'user' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-100'}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-lg bg-gray-800 text-gray-100 text-sm animate-pulse">
                      {BOT_NAME} is typing...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form
                className="flex items-center gap-2 p-3 border-t border-primary bg-gray-900 rounded-b-xl"
                onSubmit={e => { e.preventDefault(); handleSend(); }}
              >
                <input
                  type="text"
                  className="flex-1 rounded bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  maxLength={200}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dull text-white rounded-full p-2 transition"
                  disabled={!input.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <div className="px-4 pb-2 pt-1 text-xs text-gray-400">
                <span>Common questions:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {FAQS.map((faq, idx) => (
                    <button
                      key={idx}
                      className="bg-gray-800 hover:bg-primary/20 text-primary rounded-full px-3 py-1 text-xs border border-primary/30"
                      onClick={() => setInput(faq.q)}
                      type="button"
                    >
                      {faq.q}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Support tab content
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900" style={{ maxHeight: 320 }}>
                <div className="text-xs text-gray-400">We typically respond within a few hours.</div>
                <input
                  className="w-full rounded bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none border border-gray-700"
                  placeholder="Your name"
                  value={name}
                  onChange={e=>setName(e.target.value)}
                />
                <input
                  className="w-full rounded bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none border border-gray-700"
                  placeholder="Your email (optional)"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                />
                <input
                  className="w-full rounded bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none border border-gray-700"
                  placeholder="Subject"
                  value={subject}
                  onChange={e=>setSubject(e.target.value)}
                />
                <textarea
                  rows={4}
                  className="w-full rounded bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none border border-gray-700"
                  placeholder="Describe your issue..."
                  value={message}
                  onChange={e=>setMessage(e.target.value)}
                />
              </div>
              <div className="p-3 border-t border-primary bg-gray-900 rounded-b-xl flex items-center justify-end">
                <button
                  onClick={submitTicket}
                  className="bg-primary hover:bg-primary-dull text-white rounded px-4 py-2 text-sm disabled:opacity-60"
                  disabled={submitting || !message.trim()}
                >
                  {submitting ? 'Sending...' : 'Send to Support'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
