import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle, Send, X, Film, Star, Calendar, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAppContext } from '../context/AppContext'
import { useUser } from '@clerk/clerk-react'

const WELCOME = `Hi, I'm DeepAI 🎬. I can help with:
- Available movies and seats
- Recommendations and comparisons
- Opinions (pros/cons) and what to pick
- Site help & navigation (try: open favorites)
- Movie knowledge\n\nAsk me: "show available movies", "check seats for show 123", "recommend sci‑fi", "compare Avengers vs Batman", or "open favorites".`

function useScrollToEnd(ref) {
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  })
}

export default function DeepAI() {
  const navigate = useNavigate()
  const { isSignedIn } = useUser()
  const { shows } = useAppContext()

  const [open, setOpen] = useState(() => {
    try { return JSON.parse(localStorage.getItem('deepai_open') || 'false') } catch { return false }
  })
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('deepai_messages') || 'null')
      if (Array.isArray(saved) && saved.length) return saved
    } catch {}
    return [{ from: 'bot', text: WELCOME }]
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)
  useScrollToEnd(endRef)

  useEffect(() => { try { localStorage.setItem('deepai_open', JSON.stringify(open)) } catch {} }, [open])
  useEffect(() => { try { localStorage.setItem('deepai_messages', JSON.stringify(messages)) } catch {} }, [messages])

  const quick = useMemo(() => ([
    { label: 'Available Movies', text: 'Show available movies' },
    { label: 'Check Seats', text: 'Check seat availability' },
    { label: 'Recommend', text: 'Recommend movies' },
    { label: 'Compare', text: 'Compare movies' },
    { label: 'Opinions', text: 'Which should I watch and why?' },
    { label: 'Site Help', text: 'How do I find my bookings?' },
  ]), [])

  // Lightweight local intent handling before calling backend
  const localIntent = (text) => {
    const q = text.toLowerCase()
    const genres = ['action','adventure','animation','biography','comedy','crime','documentary','drama','family','fantasy','history','horror','mystery','romance','sci-fi','sport','thriller','war','western']
    const matchedGenre = genres.find(g => q.includes(g) || q.includes(g.replace('-', ' ')))

    // If user asks for available seats
    if (q.includes('available seat') || q.includes('show seat') || q.includes('check seat')) {
      // try to find the most recent title mentioned in chat
      const lastUserMovie = [...messages].reverse().map(m => m.text.toLowerCase()).find(t => shows.some(s => (s.title||'').toLowerCase() && t.includes((s.title||'').toLowerCase())))
      const title = lastUserMovie ? (shows.find(s => lastUserMovie.includes((s.title||'').toLowerCase()))?.title) : null
      if (!title) {
        const top = shows.slice(0,5).map(s => `• ${s.title}`).join('\n')
        return `Which movie? Please pick one:\n${top}`
      }
      const match = shows.find(s => (s.title||'').toLowerCase() === title.toLowerCase())
      if (!match || !match.dateTime) return `I couldn't find showtimes for ${title}.`
      const todayKey = Object.keys(match.dateTime)[0]
      const times = (match.dateTime[todayKey]||[]).slice(0,3).map(t => t.time).join(', ')
      return `Seats for ${title}: next showtimes ${times}. Open seat map? <nav target="/movies/${match._id}/${todayKey}">`
    }

    // Genre-based discovery
    if (matchedGenre) {
      const list = shows.filter(s => (s.genre||'').toLowerCase().includes(matchedGenre)).slice(0,6)
      if (!list.length) return null
      const lines = list.map(s => `• ${s.title} — ${new Date(s.release_date||Date.now()).getFullYear()}`).join('\n')
      return `Here are some ${matchedGenre} picks you can book now:\n${lines}\nSay "show seats for <title>" to continue.`
    }
    return null
  }

  const reply = async (userText) => {
    setTyping(true)
    try {
      const local = localIntent(userText)
      if (local) {
        setMessages(m => [...m, { from: 'bot', text: local }])
        return
      }
      const history = messages.map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', text: m.text })).slice(-10)
      // Prefer structured assistant endpoint when available
      const payload = await api.post('/api/deepai/assistant', {
        messages: history.concat([{ role: 'user', text: userText }])
      })
      const data = payload?.data
      const text = data?.text || data?.data?.answer || data?.data?.opinion || 'Sorry, I could not find an answer.'
      // Lightweight navigation tag support: <nav target="/favorite">
      const navMatch = text.match(/<nav\s+target="([^"]+)"\s*>/i)
      if (navMatch && navMatch[1]) {
        navigate(navMatch[1])
      }
      setMessages(m => [...m, { from: 'bot', text }])
    } catch (_) {
      setMessages(m => [...m, { from: 'bot', text: 'DeepAI is unavailable right now. Please try again.' }])
    } finally {
      setTyping(false)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setMessages(m => [...m, { from: 'user', text }])
    setInput('')
    reply(text)
  }

  const launcher = (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open DeepAI"
      title="DeepAI"
      className="fixed right-4 bottom-4 sm:right-6 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 z-[2147483000] rounded-full p-3 shadow-lg border border-gray-700 bg-gray-900/90 backdrop-blur hover:bg-gray-800 transition-colors"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <MessageCircle className="w-5 h-5 text-primary" />
    </button>
  )

  if (!open) {
    return typeof document !== 'undefined' ? createPortal(launcher, document.body) : launcher
  }

  const panel = (
    <div
      className="fixed right-4 left-4 sm:left-auto sm:right-6 top-auto bottom-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 w-auto sm:w-80 max-w-[92vw] backdrop-blur-xl bg-zinc-900/85 text-zinc-100 rounded-xl shadow-2xl border border-zinc-800 overflow-hidden"
      style={{ zIndex: 2147483647 }}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600">
        <div className="flex items-center gap-2 font-semibold"><Film size={18}/> DeepAI</div>
        <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80"><X size={18} /></button>
      </div>
      <div className="h-72 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${m.from === 'bot' ? 'bg-zinc-800 text-zinc-100 self-start' : 'bg-rose-600 text-white ml-auto'}`}
               style={{ alignSelf: m.from === 'bot' ? 'flex-start' : 'flex-end' }}>
            {m.text}
          </div>
        ))}
        {typing && <div className="text-xs text-zinc-400">DeepAI is typing…</div>}
        <div ref={endRef} />
      </div>
      <div className="p-2 border-t border-zinc-800">
        <div className="flex gap-2 mb-2 flex-wrap">
          {quick.map(q => (
            <button key={q.label} onClick={() => { setMessages(m => [...m, { from: 'user', text: q.text }]); reply(q.text) }} className="px-2 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20">
              {q.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
            placeholder="Ask about movies…"
            className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button onClick={handleSend} className="p-2 rounded bg-rose-600 hover:bg-rose-500"><Send size={16} /></button>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel
}
