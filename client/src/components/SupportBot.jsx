import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LifeBuoy, Send, X, HelpCircle, Mail, FileText } from 'lucide-react'
import api from '../lib/api'
import { useAuth, useUser } from '@clerk/clerk-react'

export default function SupportBot() {
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth()

  const [open, setOpen] = useState(() => {
    try { return JSON.parse(localStorage.getItem('supportbot_open') || 'false') } catch { return false }
  })
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('supportbot_messages') || 'null')
      if (Array.isArray(saved) && saved.length) return saved
    } catch {}
    return [
      { from: 'bot', text: 'Hi, I\'m SupportBot. Ask me about refunds, cancellations, payment issues, or say "contact human".' }
    ]
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('medium')
  const [guestEmail, setGuestEmail] = useState('')
  const [attachments, setAttachments] = useState([{ name: '', url: '' }])
  const [uploading, setUploading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => localStorage.setItem('supportbot_open', JSON.stringify(open)), [open])
  useEffect(() => localStorage.setItem('supportbot_messages', JSON.stringify(messages)), [messages])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { from: 'user', text }])
    setInput('')
    setTyping(true)
    const r = await reply(text)
    setTimeout(() => {
      setMessages((m) => {
        const next = [...m, { from: 'bot', text: r.text }]
        if (!open) setUnread(u => u + 1)
        return next
      })
      setTyping(false)
    }, 400)
  }

  // Cloudinary upload helper (component scope)
  const handleUpload = async (file) => {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    if (!cloud || !preset) {
      alert('Upload not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in client/.env')
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('upload_preset', preset)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, { method: 'POST', body: form })
      const data = await res.json()
      if (!data?.secure_url) throw new Error('Upload failed')
      setAttachments(arr => arr.length < 3 ? [...arr, { name: file.name, url: data.secure_url }] : arr)
    } catch (e) {
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const reply = async (userText) => {
    const t = userText.toLowerCase()

    // FAQs
    if (/faq|help|questions?/.test(t)) {
      try {
        const res = await api.get('/api/support/faqs')
        if (!res.data?.success) return { text: 'Could not load FAQs right now.' }
        const lines = (res.data.faqs || []).map(f => `• ${f.q}\n  ${f.a}`)
        return { text: `Here are some FAQs:\n${lines.join('\n')}` }
      } catch { return { text: 'Could not load FAQs right now.' } }
    }

    // Cancellation / Refund guidance
    if (/cancel|refund/.test(t)) {
      return { text: 'To cancel: Go to My Bookings > select booking > Cancel (if within the allowed time). Refunds are issued to the original payment method within 5-7 business days.' }
    }

    // Payment issue guidance
    if (/payment|deduct|upi|card|failed/.test(t)) {
      setCategory('payment')
      return { text: 'For payment issues: wait a few minutes for sync. If not reflected, please share payment reference, amount, and time via "contact human" to create a ticket.' }
    }

    // List my tickets
    if (/my tickets|my support|support tickets/.test(t)) {
      if (!isSignedIn) return { text: 'Please sign in to view your support tickets.' }
      try {
        const token = await getToken()
        const res = await api.get('/api/support/my', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.data?.success) return { text: res.data?.message || 'Unable to load your tickets.' }
        const items = res.data.tickets || []
        if (!items.length) return { text: 'You have no support tickets yet.' }
        const lines = items.slice(0, 5).map(t => `#${t._id.slice(-6)} • ${t.status} • ${new Date(t.createdAt).toLocaleString()} • ${t.subject}`)
        return { text: `Your latest tickets:\n${lines.join('\n')}` }
      } catch { return { text: 'Unable to load your tickets right now.' } }
    }

    // Ticket status
    if (/status\s+#?([a-f0-9]{6,24})/.test(t)) {
      const idFrag = RegExp.$1
      if (!isSignedIn) return { text: 'Please sign in to view ticket status.' }
      if (idFrag.length < 24) {
        return { text: 'Please use the full ticket ID. Tip: Say "my tickets" and click-copy the full ID from the list.' }
      }
      try {
        const token = await getToken()
        const res = await api.get(`/api/support/${idFrag}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.data?.success) return { text: res.data?.message || 'Could not fetch ticket.' }
        const tk = res.data.ticket
        return { text: `Ticket #${tk._id.slice(-6)} • ${tk.status}\nSubject: ${tk.subject}\nLast update: ${new Date(tk.updatedAt).toLocaleString()}` }
      } catch { return { text: 'Could not fetch ticket right now.' } }
    }

    // Contact human / create ticket
    if (/contact|agent|human|support|email|issue|problem/.test(t)) {
      // try to parse subject/message
      const subject = (userText.match(/subject\s*:\s*(.*)/i)?.[1] || '').trim() || 'Support Request'
      const message = (userText.replace(/subject\s*:.*/i, '').trim()) || userText
      try {
        const name = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : undefined
        const emailAddr = user?.primaryEmailAddress?.emailAddress
        const res = await api.post('/api/support/ticket', {
          name: name || (isSignedIn ? undefined : 'Guest'),
          email: emailAddr || (guestEmail || undefined),
          subject,
          message,
          category,
          priority,
          attachments: attachments.filter(a => a.url.trim()).map(a => ({ name: a.name || a.url, url: a.url }))
        })
        if (!res.data?.success) return { text: res.data?.message || 'Could not submit your request.' }
        return { text: `I have created a support ticket for you. Reference: #${String(res.data.ticketId).slice(-6)}. Our team will reach out via email.` }
      } catch { return { text: 'Could not submit your request right now.' } }
    }

    // Default
    return { text: 'I can help with FAQs, cancellations/refunds, payment issues, or create a ticket. Try: "FAQs", "my tickets", "status #<id>", or "contact human".' }
  }

  const renderLauncher = () => (
    <button
      onClick={() => { setOpen(true); setUnread(0) }}
      className="fixed bottom-6 right-24 p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 relative"
      style={{ position: 'fixed', right: '84px', bottom: '24px', zIndex: 2147483647 }}
      aria-label="Open SupportBot"
    >
      {!!unread && <span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-1 rounded-full bg-red-600">{unread}</span>}
      <LifeBuoy size={22} />
    </button>
  )

  if (!open) {
    return typeof document !== 'undefined' ? createPortal(renderLauncher(), document.body) : renderLauncher()
  }

  const panel = (
    <div
      className="fixed bottom-24 right-24 w-80 max-w-[90vw] backdrop-blur-xl bg-zinc-900/80 text-zinc-100 rounded-xl shadow-2xl border border-zinc-800 overflow-hidden transition-all duration-200 ease-out"
      style={{ position: 'fixed', right: '84px', bottom: '96px', zIndex: 2147483647 }}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600">
        <div className="flex items-center gap-2 font-semibold"><LifeBuoy size={18} /> SupportBot</div>
        <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80"><X size={18} /></button>
      </div>
      <div className="h-72 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${m.from === 'bot' ? 'bg-zinc-800 text-zinc-100 self-start' : 'bg-emerald-700 text-white ml-auto'}`}
               style={{ alignSelf: m.from === 'bot' ? 'flex-start' : 'flex-end' }}>
            {m.text}
          </div>
        ))}
        {typing && <div className="text-xs text-zinc-400">SupportBot is typing…</div>}
        <div ref={endRef} />
      </div>
      <div className="p-2 border-t border-zinc-800 space-y-2">
        {/* Quick chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="opacity-70">Category:</span>
          {['general','payment','booking','refund','technical'].map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-2 py-1 rounded-full border ${category===c?'border-emerald-500 text-emerald-400':'border-zinc-700 text-zinc-300'} hover:border-emerald-500`}>{c}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="opacity-70">Priority:</span>
          {['low','medium','high'].map(p => (
            <button key={p} onClick={() => setPriority(p)} className={`px-2 py-1 rounded-full border ${priority===p?'border-emerald-500 text-emerald-400':'border-zinc-700 text-zinc-300'} hover:border-emerald-500`}>{p}</button>
          ))}
        </div>
        {!isSignedIn && (
          <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="Your email for updates (optional)" className="w-full px-3 py-2 rounded bg-zinc-800 text-sm outline-none" />
        )}
        {/* Attachment URLs + Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>Attachment links (optional)</span>
            <button className="text-emerald-400" onClick={() => setAttachments(a => a.length<3 ? [...a, { name:'', url:'' }] : a)}>+ Add</button>
          </div>
          {/* Dropzone */}
          <div
            onDragOver={(e)=>e.preventDefault()}
            onDrop={async (e)=>{
              e.preventDefault()
              if (uploading) return
              const file = e.dataTransfer.files?.[0]
              if (!file) return
              await handleUpload(file)
            }}
            className="border border-dashed border-zinc-700 rounded p-3 text-xs text-zinc-300 hover:border-emerald-500 cursor-pointer"
            onClick={()=>{
              const el = document.createElement('input'); el.type='file'; el.accept='image/*,application/pdf';
              el.onchange = async () => { const f = el.files?.[0]; if (f) await handleUpload(f) }
              el.click()
            }}
          >
            {uploading ? 'Uploading…' : 'Drag & drop a file here, or click to upload (Cloudinary)'}
          </div>
          {attachments.map((a, idx) => (
            <div key={idx} className="flex gap-2">
              <input value={a.name} onChange={e => setAttachments(arr => arr.map((x,i)=> i===idx?{...x, name:e.target.value}:x))} placeholder="Display name" className="w-32 px-2 py-1 rounded bg-zinc-800 text-xs outline-none" />
              <input value={a.url} onChange={e => setAttachments(arr => arr.map((x,i)=> i===idx?{...x, url:e.target.value}:x))} placeholder="https://link-to-proof" className="flex-1 px-2 py-1 rounded bg-zinc-800 text-xs outline-none" />
              <button onClick={() => setAttachments(arr => arr.filter((_,i)=>i!==idx))} className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700">Remove</button>
            </div>
          ))}
        </div>
        {/* Input row */}
        <div className="flex items-center gap-2">
          <button title="FAQs" onClick={() => setInput('FAQs')} className="p-2 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700"><HelpCircle size={16} /></button>
          <button title="My tickets" onClick={() => setInput('my tickets')} className="p-2 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700"><FileText size={16} /></button>
          <button title="Contact" onClick={() => setInput('contact human')} className="p-2 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700"><Mail size={16} /></button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleSend()}
                 placeholder="Type your message…" className="flex-1 px-3 py-2 rounded bg-zinc-800 text-sm outline-none" />
          <button onClick={handleSend} className="p-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"><Send size={16} /></button>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel
}
