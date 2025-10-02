import React, { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X, Navigation, Ticket, Film, Calendar, Heart, LayoutDashboard, Home, Stars, Mic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useUser, useAuth } from '@clerk/clerk-react'

// Lightweight intent-driven assistant that can navigate across the app
// and guide users to booking. It can also trigger simple API checks if needed.

const ZINEBOT_NAME = 'ZineBot'

const quickSuggestions = [
  { label: 'Find movies', text: 'Show me movies' },
  { label: 'My bookings', text: 'Go to my bookings' },
  { label: 'Favorites', text: 'Open favorites' },
  { label: 'Theatre', text: 'Open theatre' },
  { label: 'Trending', text: 'Show trending' },
  { label: 'Book tickets', text: 'Help me book tickets' },
  { label: 'Today shows', text: 'Open movie today' },
  { label: 'Tomorrow shows', text: 'Open movie tomorrow' },
]

function useBotNavigation() {
  const navigate = useNavigate()
  const go = (path) => navigate(path)
  const intents = {
    home: () => go('/'),
    movies: () => go('/movies'),
    myBookings: () => go('/my-bookings'),
    favorites: () => go('/favorite'),
    theatre: () => go('/theatre'),
    trending: () => go('/admin/trending'), // falls back to admin page if permitted
    admin: () => go('/admin'),
  }

  // Prefs helpers (local-only)
  const updateGenrePrefs = (movie) => {
    try {
      if (!movie) return
      const prefs = JSON.parse(localStorage.getItem('zinebot_genre_prefs') || '{}')
      const genres = Array.isArray(movie.genres) ? movie.genres : []
      for (const g of genres) {
        const name = (g?.name || g)?.toString().toLowerCase()
        if (!name) continue
        prefs[name] = (prefs[name] || 0) + 1
      }
      localStorage.setItem('zinebot_genre_prefs', JSON.stringify(prefs))
    } catch {}
  }
  const getGenrePrefs = () => {
    try { return JSON.parse(localStorage.getItem('zinebot_genre_prefs') || '{}') } catch { return {} }
  }
  const addAddon = (item) => {
    try {
      const key = 'zinebot_addons'
      const list = JSON.parse(localStorage.getItem(key) || '[]')
      list.push({ item, at: Date.now() })
      localStorage.setItem(key, JSON.stringify(list))
    } catch {}
  }
  const voteFor = (name) => {
    try {
      const key = 'zinebot_votes'
      const votes = JSON.parse(localStorage.getItem(key) || '{}')
      const k = (name || '').trim()
      if (!k) return
      votes[k] = (votes[k] || 0) + 1
      localStorage.setItem(key, JSON.stringify(votes))
    } catch {}
  }
  const pollResults = () => {
    try {
      const votes = JSON.parse(localStorage.getItem('zinebot_votes') || '{}')
      const entries = Object.entries(votes).sort((a,b)=>b[1]-a[1]).slice(0,5)
      if (!entries.length) return 'No votes yet.'
      return entries.map(([k,v]) => `${k}: ${v}`).join(', ')
    } catch { return 'No votes yet.' }
  }

  const suggestBestSeats = (occupied, count = 2) => {
    // Heuristic: center seats in middle rows, avoid occupied.
    const rows = 'ABCDEFGHIJ'.split('')
    const cols = Array.from({ length: 12 }, (_, i) => i + 1)
    const prefRows = ['E', 'F', 'D', 'G', 'C', 'H', 'B', 'I', 'A', 'J']
    const occ = new Set((occupied || []).map(s => s.toUpperCase()))
    const isFree = (r, c) => !occ.has(`${r}${c}`)
    const middle = Math.ceil(cols.length / 2)
    for (const r of prefRows) {
      // look for contiguous block near center
      const candidates = []
      for (let c = 1; c <= cols.length; c++) {
        if (isFree(r, c)) candidates.push(c)
      }
      // sliding window for contiguous run of size count, closest to center
      for (let i = 0; i <= candidates.length - count; i++) {
        const block = candidates.slice(i, i + count)
        if (block[block.length - 1] - block[0] === count - 1) {
          const centerDist = Math.abs(block.reduce((a,b)=>a+b,0)/block.length - middle)
          // Return first optimal block found (implicit center-first due to order)
          return block.map(c => `${r}${c}`)
        }
      }
    }
    // Fallback: any free seats
    const free = []
    for (const r of rows) {
      for (const c of cols) if (isFree(r, c)) free.push(`${r}${c}`)
    }
    return free.slice(0, count)
  }
  return { go, intents }
}

function inferIntent(message) {
  const m = message.toLowerCase()
  if (/(^|\b)(home|start)(\b|$)/.test(m)) return 'home'
  if (m.includes('movie') || m.includes('movies') || m.includes('show me')) return 'movies'
  if (m.includes('booking') || m.includes('bookings') || m.includes('tickets') || m.includes('ticket')) return 'myBookings'
  if (m.includes('favorite') || m.includes('favourites')) return 'favorites'
  if (m.includes('theatre') || m.includes('theater')) return 'theatre'
  if (m.includes('trending')) return 'trending'
  if (m.includes('admin')) return 'admin'
  return null
}

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

function parseRequestedMovie(message) {
  // Attempts to extract a movie title after keywords like: open/show/movie
  const m = message.trim()
  const match = m.match(/(?:open|show|movie|watch)\s+(.+)/i)
  if (match) {
    // remove trailing words like 'movie' or 'film' if duplicated
    return match[1].trim()
  }
  return null
}

function parseDateFromText(message) {
  // Supports explicit YYYY-MM-DD in text
  const m = message.match(/(20\d{2}-\d{2}-\d{2})/)
  if (m) return m[1]
  const lower = message.toLowerCase()
  const today = new Date()
  if (lower.includes('today')) {
    const y = today.getFullYear()
    const mo = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    return `${y}-${mo}-${d}`
  }
  if (lower.includes('tomorrow')) {
    const tmr = new Date(today)
    tmr.setDate(today.getDate() + 1)
    const y = tmr.getFullYear()
    const mo = String(tmr.getMonth() + 1).padStart(2, '0')
    const d = String(tmr.getDate()).padStart(2, '0')
    return `${y}-${mo}-${d}`
  }
  return null
}

export default function ZineBot() {
  const { isSignedIn } = useUser()
  const { getToken } = useAuth()
  const [open, setOpen] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zinebot_open') || 'false') } catch { return false }
  })
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('zinebot_messages') || 'null')
      if (Array.isArray(saved) && saved.length) return saved
    } catch {}
    return [{ from: 'bot', text: `Hi! I am ${ZINEBOT_NAME} 🤖. I can help you find movies, pick a showtime, and guide you to book tickets. Ask me anything or try a quick suggestion below.` }]
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const chatEndRef = useRef(null)
  const { intents } = useBotNavigation()
  const [lastContext, setLastContext] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zinebot_ctx') || 'null') } catch { return null }
  })
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const [pendingCoupon, setPendingCoupon] = useState(() => {
    try { return localStorage.getItem('zinebot_coupon') || '' } catch { return '' }
  })

  useEffect(() => {
    if (open && chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Persist state
  useEffect(() => {
    try { localStorage.setItem('zinebot_messages', JSON.stringify(messages)) } catch {}
  }, [messages])
  useEffect(() => {
    try { localStorage.setItem('zinebot_open', JSON.stringify(open)) } catch {}
  }, [open])
  useEffect(() => {
    try { localStorage.setItem('zinebot_ctx', JSON.stringify(lastContext)) } catch {}
  }, [lastContext])
  useEffect(() => {
    try { localStorage.setItem('zinebot_coupon', pendingCoupon || '') } catch {}
  }, [pendingCoupon])

  // Voice input (Web Speech API) in component scope
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.lang = 'en-US'
      rec.interimResults = false
      rec.maxAlternatives = 1
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        setInput(prev => prev ? (prev + ' ' + transcript) : transcript)
      }
      rec.onend = () => setListening(false)
      recognitionRef.current = rec
    }
  }, [])

  const toggleMic = () => {
    const rec = recognitionRef.current
    if (!rec) return
    if (listening) {
      rec.stop()
      setListening(false)
    } else {
      setListening(true)
      try { rec.start() } catch {}
    }
  }

  // Utilities
  const downloadICS = (title, startISO, durationMinutes = 120) => {
    try {
      const start = new Date(startISO)
      const end = new Date(start.getTime() + durationMinutes * 60000)
      const dtstamp = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const dtstart = dtstamp
      const dtend = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ZineBot//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@zinebot`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${(title || 'Movie Show').replace(/\n/g, ' ')}`,
        'DESCRIPTION:Movie show booked via ZineBot',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n')
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(title || 'show').replace(/[^a-z0-9]/gi, '_')}.ics`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {}
  }

  const chooseShowForDate = async (movieId, date) => {
    // Fetch shows for movie and pick the earliest showtime for the given date.
    const { data } = await api.get(`/api/show/${movieId}`)
    if (!data?.success) return null
    const day = data.dateTime?.[date]
    if (!Array.isArray(day) || day.length === 0) return null
    day.sort((a, b) => new Date(a.time) - new Date(b.time))
    const first = day[0]
    return { showId: first.showId, startISO: first.time, movie: data.movie }
  }

  const parseCount = (text) => {
    const m = text.match(/\b(\d{1,2})\b/)
    return m ? parseInt(m[1], 10) : null
  }
  const parseTimeBucket = (text) => {
    const t = text.toLowerCase()
    if (/morning|\b(7|8|9|10|11)\s*(am)\b/.test(t)) return 'morning'
    if (/afternoon|noon|\b(12|1|2|3|4)\s*(pm)\b/.test(t)) return 'afternoon'
    if (/evening|\b(5|6|7)\s*(pm)\b/.test(t)) return 'evening'
    if (/night|tonight|\b(8|9|10|11)\s*(pm)\b/.test(t)) return 'night'
    return null
  }
  const chooseShowForDateAndBucket = async (movieId, date, bucket) => {
    const { data } = await api.get(`/api/show/${movieId}`)
    if (!data?.success) return null
    const day = data.dateTime?.[date]
    if (!Array.isArray(day) || day.length === 0) return null
    const inBucket = (iso) => {
      const h = new Date(iso).getHours()
      if (bucket === 'morning') return h >= 7 && h < 12
      if (bucket === 'afternoon') return h >= 12 && h < 17
      if (bucket === 'evening') return h >= 17 && h < 20
      if (bucket === 'night') return h >= 20 && h <= 23
      return true
    }
    const list = day.filter(s => inBucket(s.time)).sort((a,b) => new Date(a.time) - new Date(b.time))
    const pick = list[0] || day[0]
    return pick ? { showId: pick.showId, startISO: pick.time, movie: data.movie } : null
  }

  const reply = async (userText) => {
    const intent = inferIntent(userText)

    // Simple action responses
    if (intent === 'home') return { text: 'Taking you home 🏠', action: () => intents.home() }
    if (intent === 'movies') return { text: 'Opening movies 🎬', action: () => intents.movies() }
    if (intent === 'myBookings') return { text: 'Opening your bookings 🎟️', action: () => intents.myBookings() }
    if (intent === 'favorites') return { text: 'Opening favorites ❤️', action: () => intents.favorites() }
    if (intent === 'theatre') return { text: 'Opening theatre 🎭', action: () => intents.theatre() }
    if (intent === 'trending') return { text: 'Taking you to trending 📈 (admin area)', action: () => intents.trending() }
    if (intent === 'admin') return { text: 'Opening admin dashboard 🔐', action: () => intents.admin() }

    // Booking guidance
    if (/(book|buy).*ticket/.test(userText.toLowerCase()) || userText.toLowerCase().includes('help me book')) {
      if (!isSignedIn) {
        return {
          text: 'Please sign in to continue with booking. Use the account button in the navbar, then ask me again to book.',
        }
      }
      return {
        text:
          'Sure! To book: 1) I will open Movies for you. 2) Pick a movie. 3) Choose a date/time. 4) Select seats and proceed to pay. Let’s start by opening Movies.',
        action: () => intents.movies(),
      }
    }

    // Availability queries: "Are seats available for <movie> [today|tonight|tomorrow|YYYY-MM-DD]"
    if (/^are\s+seats?\s+available\s+for\s+(.+?)(?:\s+(today|tonight|tomorrow|20\d{2}-\d{2}-\d{2}))?\??$/i.test(userText)) {
      try {
        const [, rawTitle, rawWhen] = userText.match(/^are\s+seats?\s+available\s+for\s+(.+?)(?:\s+(today|tonight|tomorrow|20\d{2}-\d{2}-\d{2}))?\??$/i) || []
        const title = rawTitle?.trim()
        if (!title) return { text: 'Please specify the movie title.' }
        const { data } = await api.get('/api/show/all')
        const movies = Array.isArray(data?.shows) ? data.shows : []
        const wanted = normalize(title)
        const found = movies.find(m => normalize(m.title) === wanted)
        if (!found) return { text: 'I could not find that movie currently.' }
        const date = rawWhen === 'tonight' ? parseDateFromText('today') : (rawWhen ? parseDateFromText(rawWhen) : parseDateFromText('today'))
        const bucket = rawWhen === 'tonight' ? 'night' : null
        const chosen = bucket ? await chooseShowForDateAndBucket(found._id, date, bucket) : await chooseShowForDate(found._id, date)
        if (!chosen?.showId) return { text: `I couldn't find showtimes for ${found.title} on ${date}.` }
        let occupied = []
        try {
          const seatsRes = await api.get(`/api/booking/seats/${chosen.showId}`)
          if (seatsRes.data?.success) occupied = seatsRes.data.occupiedSeats || []
        } catch {}
        const status = occupied.length > 70 ? 'selling fast' : (occupied.length > 100 ? 'almost full' : 'available')
        setLastContext({ movieId: found._id, title: found.title, date, showId: chosen.showId, startISO: chosen.startISO })
        return { text: `Seats are ${status} for ${found.title} on ${date}. You can say: "book seats A1,A2".` }
      } catch { return { text: 'I could not check availability right now.' } }
    }

    // Natural booking: "Book 2 tickets for Inception tomorrow evening"
    if (/^book\s+\d+\s+tickets?\s+for\s+.+/i.test(userText)) {
      const count = parseCount(userText) || 2
      const movieTitle = parseRequestedMovie(userText)
      if (!movieTitle) return { text: 'Which movie would you like to book?' }
      const date = parseDateFromText(userText) || parseDateFromText('today')
      const bucket = parseTimeBucket(userText)
      try {
        const { data } = await api.get('/api/show/all')
        const movies = Array.isArray(data?.shows) ? data.shows : []
        const wanted = normalize(movieTitle)
        const scored = movies.map(mv => ({ mv, score: normalize(mv.title) === wanted ? 100 : 0 }))
        const best = scored.sort((a,b)=>b.score-a.score)[0]
        if (!best?.mv?._id) return { text: 'I could not find that movie currently.' }
        const chosen = bucket ? await chooseShowForDateAndBucket(best.mv._id, date, bucket) : await chooseShowForDate(best.mv._id, date)
        if (!chosen?.showId) return { text: `No showtimes found for ${best.mv.title} on ${date}.` }
        setLastContext({ movieId: best.mv._id, title: best.mv.title, date, showId: chosen.showId, startISO: chosen.startISO })
        return { text: `Great! I found a show for ${best.mv.title} on ${date}${bucket ? ' ('+bucket+')' : ''}. For ${count} tickets, you can say: "book seats A1,A2" or let me know your preferred row.` }
      } catch { return { text: 'I had trouble searching shows right now.' } }
    }
    // Seat availability quick helper if user provides showId (power user flow)
    const showIdMatch = userText.match(/showid\s*[:#-]?\s*([a-f0-9]{24})/i)
    if (showIdMatch) {
      const showId = showIdMatch[1]
      try {
        const res = await api.get(`/api/booking/seats/${showId}`)
        if (res.data?.success) {
          return { text: `I found ${res.data.occupiedSeats.length} occupied seats for that show. I’ll take you to the seat selection screen next.`, action: () => {} }
        }
      } catch (_) {}
      return { text: 'I could not verify seats for that show right now, but you can proceed to seat selection from the movie page.' }
    }

    // Try deep-linking to a specific movie by title (and optional date)
    const maybeTitle = parseRequestedMovie(userText)
    if (maybeTitle) {
      try {
        const wanted = normalize(maybeTitle)
        const { data } = await api.get('/api/show/all')
        const movies = Array.isArray(data?.shows) ? data.shows : []
        // simple fuzzy: prioritize exact contains on normalized title; else startswith; else any token match
        const scored = movies.map((mv) => {
          const title = normalize(mv?.title)
          let score = 0
          if (!title) return { mv, score: -1 }
          if (title === wanted) score = 100
          else if (title.includes(wanted)) score = 90
          else if (wanted.includes(title)) score = 80
          else if (title.startsWith(wanted)) score = 70
          else {
            const tokens = wanted.split(/\s+/).filter(Boolean)
            const hits = tokens.filter(t => title.includes(t)).length
            score = hits * 10
          }
          return { mv, score }
        }).sort((a,b) => b.score - a.score)

        const best = scored[0]
        if (best && best.score >= 30 && best.mv && best.mv._id) {
          const date = parseDateFromText(userText)
          if (date) {
            // Seat-aware: pick earliest show for the date and check occupancy
            try {
              const chosen = await chooseShowForDate(best.mv._id, date)
              if (chosen?.showId) {
                let occupied = []
                try {
                  const seatsRes = await api.get(`/api/booking/seats/${chosen.showId}`)
                  if (seatsRes.data?.success) occupied = seatsRes.data.occupiedSeats || []
                } catch {}
                const availabilityText = `I found ${occupied.length} occupied seats; plenty may still be available.`
                setLastContext({ movieId: best.mv._id, title: best.mv.title, date, showId: chosen.showId, startISO: chosen.startISO })
                updateGenrePrefs(best.mv)
                return { text: `Opening ${best.mv.title} on ${date}. ${availabilityText}`, action: () => intents.movies(), deepLink: { id: best.mv._id, date } }
              }
            } catch {}
            return { text: `Opening ${best.mv.title} on ${date}.`, action: () => intents.movies(), deepLink: { id: best.mv._id, date } }
          }
          // No date provided: open movie details
          setLastContext({ movieId: best.mv._id, title: best.mv.title })
          updateGenrePrefs(best.mv)
          return { text: `Opening ${best.mv.title}.`, action: () => intents.movies(), deepLink: { id: best.mv._id } }
        }
        return { text: 'I could not find that movie. Try a different title or open Movies to browse.' }
      } catch (e) {
        return { text: 'I had trouble searching shows just now. Please try again or open Movies to browse.' }
      }
    }

    // Genre-based search: "show action movies"
    if (/show\s+([a-z]+)\s+movies/i.test(userText)) {
      try {
        const genre = RegExp.$1.toLowerCase()
        const { data } = await api.get('/api/show/all')
        const movies = Array.isArray(data?.shows) ? data.shows : []
        const results = movies.filter(mv => Array.isArray(mv.genres) && mv.genres.some(g => (g.name || '').toLowerCase() === genre))
        if (!results.length) return { text: `I couldn't find ${genre} movies right now.` }
        const names = results.slice(0, 5).map(m => m.title).join(', ')
        return { text: `Here are some ${genre} movies: ${names}. You can say: "Open movie ${results[0].title}"` }
      } catch { return { text: 'I could not search genres right now.' } }
    }

    // Support ticket quick command: "contact support ..."
    if (/^contact\s+support\b/i.test(userText)) {
      const message = userText.replace(/^contact\s+support\b\s*:?\s*/i, '') || 'Support request from ZineBot'
      try {
        await api.post('/api/support/ticket', { name: 'ZineBot User', email: '', subject: 'Support via ZineBot', message })
        return { text: 'Your support request has been submitted. Our team will reach out via email.' }
      } catch { return { text: 'Sorry, I could not submit your support request right now.' } }
    }

    // Reminders: "add reminder" uses lastContext
    if (/add\s+reminder/i.test(userText)) {
      if (lastContext?.title && lastContext?.startISO) {
        downloadICS(lastContext.title, lastContext.startISO)
        return { text: 'Calendar reminder downloaded.' }
      }
      return { text: 'I need a movie and showtime first. Try: "Open movie <title> YYYY-MM-DD" then say "add reminder".' }
    }

    // Show seat layout (ASCII) for current show
    if (/show\s+seat\s+layout/i.test(userText)) {
      if (!lastContext?.showId) return { text: 'I need a selected showtime first. Try: "Open movie <title> YYYY-MM-DD".' }
      try {
        let occupied = []
        try {
          const seatsRes = await api.get(`/api/booking/seats/${lastContext.showId}`)
          if (seatsRes.data?.success) occupied = seatsRes.data.occupiedSeats || []
        } catch {}
        const occ = new Set((occupied || []).map(s => s.toUpperCase()))
        const rows = 'ABCDEFGHIJ'.split('')
        const cols = Array.from({ length: 12 }, (_, i) => i + 1)
        const lines = rows.map(r => {
          const row = cols.map(c => (occ.has(`${r}${c}`) ? 'X' : 'O')).join(' ')
          return `${r}: ${row}`
        })
        return { text: `Seat layout (O=free, X=booked):\n${lines.join('\n')}` }
      } catch { return { text: 'I could not render the seat layout right now.' } }
    }

    // Offers and coupons
    if (/offers?|discounts?/i.test(userText)) {
      return { text: 'Current offers: Paytm cashback, GPay UPI discount, Credit Card bank offers (if available). At checkout, eligible coupons may auto-apply.' }
    }
    if (/apply\s+coupon\s+([A-Z0-9_-]{3,20})/i.test(userText)) {
      const code = RegExp.$1
      setPendingCoupon(code)
      return { text: `Coupon ${code} saved. I will try to apply it during checkout if eligible.` }
    }

    // Reminders (Phase 3)
    if (/^remind\s+me/i.test(userText)) {
      if (!isSignedIn) return { text: 'Please sign in to set reminders.' }
      if (!lastContext?.showId) return { text: 'Select a movie/show first so I can set a reminder.' }
      try {
        // parse minutes and channel from text
        const m = userText.match(/in\s+(\d{1,3})\s*min/i)
        const minutes = m ? parseInt(m[1], 10) : 30
        const ch = (userText.match(/\b(email|sms|whatsapp)\b/i)?.[1] || 'email').toLowerCase()
        const token = await getToken()
        const res = await api.post('/api/notify/reminder', { showId: lastContext.showId, channel: ch, minutesBefore: minutes }, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.data?.success) return { text: `Reminder set via ${ch} ~${minutes} min before show.` }
        return { text: res.data?.message || 'Could not set reminder.' }
      } catch { return { text: 'I could not set the reminder right now.' } }
    }
    if (/^my\s+reminders/i.test(userText)) {
      if (!isSignedIn) return { text: 'Please sign in to view reminders.' }
      try {
        const token = await getToken()
        const res = await api.get('/api/notify/my', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.data?.success) return { text: res.data?.message || 'Could not fetch reminders.' }
        const items = res.data.reminders || []
        if (!items.length) return { text: 'You have no reminders yet.' }
        const lines = items.map(r => `- ${new Date(r?.show?.showDateTime || r?.sendAt).toLocaleString()} (${r.channel})`)
        return { text: `Your reminders:\n${lines.join('\n')}` }
      } catch { return { text: 'Could not fetch reminders right now.' } }
    }

    // Community polls (Phase 4)
    if (/^vote\b/i.test(userText)) {
      try {
        const m = userText.match(/^vote\s+(?:for\s+)?(.+?)(?:\s+in\s+([\w-]+))?\s*$/i)
        if (!m) return { text: 'Try: "vote for Popcorn in snacks"' }
        const option = m[1]?.trim()
        const key = (m[2]?.trim() || 'community')
        const token = await getToken()
        const res = await api.post('/api/poll/vote', { key, option }, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.data?.success) return { text: res.data?.message || 'Could not record vote.' }
        const opts = (res.data.poll?.options || []).slice().sort((a,b)=> (b.count||0)-(a.count||0)).slice(0,5)
        const summary = opts.length ? opts.map(o=> `${o.name}: ${o.count}`).join(', ') : 'no votes yet'
        return { text: `Vote recorded for "${option}" in ${key}. Top: ${summary}` }
      } catch { return { text: 'Could not record your vote right now.' } }
    }
    if (/^poll\s+results/i.test(userText)) {
      try {
        const m = userText.match(/^poll\s+results(?:\s+for\s+([\w-]+))?/i)
        const key = (m?.[1] || 'community')
        const res = await api.get(`/api/poll/${encodeURIComponent(key)}/results`)
        if (!res.data?.success) return { text: res.data?.message || 'Could not fetch poll results.' }
        const opts = (res.data.poll?.options || []).slice().sort((a,b)=> (b.count||0)-(a.count||0)).slice(0,5)
        if (!opts.length) return { text: `No votes yet for ${key}.` }
        const lines = opts.map(o=> `- ${o.name}: ${o.count}`)
        return { text: `Results for ${key}:\n${lines.join('\n')}` }
      } catch { return { text: 'Could not fetch poll results right now.' } }
    }

    // Admin commands (protected)
    if (/^admin\s+dashboard/i.test(userText)) {
      if (!isSignedIn) return { text: 'Admin access requires sign-in.' }
      try {
        const token = await getToken({ template: 'default' })
        const res = await api.get('/api/admin/dashboard', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.data?.success) return { text: res.data?.message || 'Could not fetch dashboard.' }
        const d = res.data.dashboardData
        const top = (d.shows || []).slice().sort((a,b)=> (b.occupancy||0)-(a.occupancy||0)).slice(0,3)
        const lines = [
          `Bookings: ${d.totalBookings} | Revenue: $${Math.round(d.totalRevenue)} | Avg occupancy: ${d.avgOccupancy}%`,
          'Top shows by occupancy:',
          ...top.map(s=> `- ${s.movie?.title || 'Unknown'} @ ${new Date(s.showDateTime).toLocaleString()} — ${s.occupancy}%`)
        ]
        return { text: lines.join('\n') }
      } catch { return { text: 'Dashboard is not available right now.' } }
    }

    if (/(^|\b)(popular|top)\s+movies(\b|$)/i.test(userText)) {
      if (!isSignedIn) return { text: 'Please sign in.' }
      try {
        const token = await getToken()
        const res = await api.get('/api/admin/dashboard', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.data?.success) return { text: res.data?.message || 'Could not fetch data.' }
        const shows = res.data.dashboardData?.shows || []
        const top = shows.slice().sort((a,b)=> (b.occupancy||0)-(a.occupancy||0)).slice(0,5)
        const lines = [ 'Popular right now:', ...top.map(s=> `- ${s.movie?.title || 'Unknown'} — ${s.occupancy}% full`) ]
        return { text: lines.join('\n') }
      } catch { return { text: 'Could not fetch popular movies.' } }
    }

    if (/risk\s*flags?/i.test(userText)) {
      if (!isSignedIn) return { text: 'Admin access requires sign-in.' }
      try {
        const token = await getToken()
        const res = await api.get('/api/admin/risk-flags', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.data?.success) return { text: res.data?.message || 'Could not fetch risk flags.' }
        const f = res.data.flags || {}
        const heavy = (f.heavyUsers || []).map(u=> `- User ${u.user}: ${u.count} bookings in 7d`)
        const zero = (f.zeroPaid || []).map(b=> `- Booking ${b._id} amount ${b.amount}`)
        const lines = [
          'Risk flags:',
          heavy.length ? 'Heavy users:\n' + heavy.join('\n') : 'No heavy user activity detected.',
          zero.length ? 'Zero/negative paid:\n' + zero.join('\n') : 'No zero-amount paid bookings.'
        ]
        return { text: lines.join('\n') }
      } catch { return { text: 'Risk flags not available right now.' } }
    }

    // Waitlist stub
    if (/waitlist\s+me/i.test(userText)) {
      if (!isSignedIn) return { text: 'Please sign in so I can add you to the waitlist.' }
      if (!lastContext?.showId) return { text: 'Tell me the movie/date first so I can waitlist you.' }
      try {
        const token = await getToken()
        const res = await api.post('/api/waitlist/add', { showId: lastContext.showId }, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.data?.success) return { text: `You are on the waitlist for ${lastContext.title} on ${lastContext.date}. I will notify you if seats free up.` }
        return { text: res.data?.message || 'Could not add to waitlist right now.' }
      } catch { return { text: 'I could not add you to the waitlist right now.' } }
    }

    // Quick rating
    if (/^rate\s+(my\s+)?(experience|movie)\s+(\d)(?:\/5)?/i.test(userText)) {
      const score = parseInt(RegExp.$3, 10)
      return { text: `Thanks for rating ${score}/5! Your feedback helps improve recommendations and service.` }
    }

    // In-chat seat booking: "book seats A1,A2" (uses lastContext.showId)
    const seatMatch = userText.match(/book\s+seats?\s+([A-Z]\d+(?:[\s,]+[A-Z]\d+)*)/i)
    if (seatMatch) {
      if (!isSignedIn) return { text: 'Please sign in to book seats.' }
      if (!lastContext?.showId) return { text: 'I need a selected showtime first. Try: "Open movie <title> YYYY-MM-DD".' }
      const seats = seatMatch[1].split(/[\s,]+/).filter(Boolean)
      try {
        const token = await getToken()
        // Check if green ticketing is enabled
        const greenTicketingEnabled = localStorage.getItem('green_ticketing_enabled') === 'true';
        
        const res = await api.post('/api/booking/create', { 
          showId: lastContext.showId, 
          selectedSeats: seats, 
          couponCode: pendingCoupon || undefined,
          greenTicketingDonation: greenTicketingEnabled
        }, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.data?.success && res.data?.url) {
          const applied = res.data?.couponCode ? ` (coupon ${res.data.couponCode} applied, saved ${res.data.discountAmount || 0})` : ''
          return { text: `Booking created for seats ${seats.join(', ')}${applied}. Pay here: ${res.data.url}` }
        }
        return { text: res.data?.message || 'Booking attempt finished, but I did not receive a payment link.' }
      } catch (e) {
        return { text: 'Sorry, I could not create the booking. Seats may be unavailable or there was a server issue.' }
      }
    }

    // Seat suggestions: "suggest best seats for 2"
    if (/suggest\s+best\s+seats?(?:\s+for\s+(\d+))?/i.test(userText)) {
      const m = userText.match(/suggest\s+best\s+seats?(?:\s+for\s+(\d+))?/i)
      const count = m && m[1] ? parseInt(m[1], 10) : 2
      if (!lastContext?.showId) return { text: 'I need a selected showtime first. Try: "Open movie <title> YYYY-MM-DD".' }
      try {
        let occupied = []
        try {
          const seatsRes = await api.get(`/api/booking/seats/${lastContext.showId}`)
          if (seatsRes.data?.success) occupied = seatsRes.data.occupiedSeats || []
        } catch {}
        const suggest = suggestBestSeats(occupied, count)
        if (!suggest.length) return { text: 'I could not find free seats to suggest.' }
        return { text: `Suggested seats: ${suggest.join(', ')}. Say: "book seats ${suggest.join(', ')}" to proceed.` }
      } catch { return { text: 'I could not generate suggestions right now.' } }
    }

    // Cancellation guidance
    if (/cancel\s+(my\s+)?(latest\s+)?booking/i.test(userText) || /refund/i.test(userText)) {
      return {
        text: 'To cancel or request a refund, open My Bookings, select the booking, and use the cancel/refund options (subject to policy and showtime cutoff). I’ll open your bookings now.',
        action: () => intents.myBookings(),
      }
    }

    // FAQ: "what's the showtime for <movie> at <time>"
    if (/what'?s\s+the\s+showtime\s+for\s+(.+?)\s+at\s+(.+)\??/i.test(userText)) {
      const [, tTitle, tTime] = userText.match(/what'?s\s+the\s+showtime\s+for\s+(.+?)\s+at\s+(.+)\??/i) || []
      const movieTitle = tTitle?.trim()
      if (!movieTitle) return { text: 'Please specify the movie title.' }
      const bucket = parseTimeBucket(tTime || '')
      const date = parseDateFromText(userText) || parseDateFromText('today')
      try {
        const { data } = await api.get('/api/show/all')
        const movies = Array.isArray(data?.shows) ? data.shows : []
        const wanted = normalize(movieTitle)
        const found = movies.find(m => normalize(m.title) === wanted)
        if (!found) return { text: 'I could not find that movie currently.' }
        const chosen = bucket ? await chooseShowForDateAndBucket(found._id, date, bucket) : await chooseShowForDate(found._id, date)
        if (!chosen?.showId) return { text: `No showtimes found for ${found.title} on ${date}.` }
        setLastContext({ movieId: found._id, title: found.title, date, showId: chosen.showId, startISO: chosen.startISO })
        updateGenrePrefs(found)
        const when = new Date(chosen.startISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        return { text: `${found.title} has a show at ${when} on ${date}. You can say: "book seats A1,A2".` }
      } catch { return { text: 'I could not fetch showtimes right now.' } }
    }

    // Personalized recommendations
    if (/^(recommend|suggest)\b.*movies?/i.test(userText)) {
      try {
        const prefs = getGenrePrefs()
        const { data } = await api.get('/api/show/all')
        const movies = Array.isArray(data?.shows) ? data.shows : []
        const scoreMovie = (mv) => {
          const genres = Array.isArray(mv.genres) ? mv.genres : []
          return genres.reduce((s,g)=> s + (prefs[(g?.name||g).toString().toLowerCase()] || 0), 0)
        }
        const ranked = movies.map(mv => ({ mv, score: scoreMovie(mv) }))
          .sort((a,b)=> b.score - a.score || a.mv.title.localeCompare(b.mv.title))
        const top = (ranked[0]?.score ? ranked : movies.map(mv=>({mv,score:0}))).slice(0,5)
        if (!top.length) return { text: 'I could not find movies to recommend right now.' }
        const names = top.map(x=>x.mv.title).join(', ')
        return { text: `Based on your taste, you might like: ${names}. You can say: "Open movie ${top[0].mv.title}"` }
      } catch { return { text: 'I could not compute recommendations right now.' } }
    }

    // Add-ons / Upsell
    if (/add\s+(snack|snacks|combo|popcorn|coffee|parking)/i.test(userText)) {
      const item = userText.match(/add\s+(.+)/i)?.[1] || 'combo'
      addAddon(item)
      return { text: `Added "${item}" to your add-ons. You can manage add-ons during checkout.` }
    }

    // Community voting
    if (/^vote\s+for\s+(.+)/i.test(userText)) {
      const name = RegExp.$1.trim()
      voteFor(name)
      return { text: `Vote recorded for ${name}. Type "poll results" to see top entries.` }
    }
    if (/^poll\s+results/i.test(userText)) {
      return { text: `Community poll results: ${pollResults()}` }
    }

    // Default small talk
    if (/(hi|hello|hey)\b/i.test(userText)) return { text: 'Hello! How can I help you today?' }
    if (/(help|support)/i.test(userText)) return { text: 'I can navigate you anywhere and guide you through booking. Try: "Show me movies" or "Go to my bookings".' }

    return { text: "I'm not sure I understood that. Try asking me to open Movies, My Bookings, Favorites, Theatre, or Admin." }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { from: 'user', text }])
    setInput('')
    setTyping(true)
    const r = await reply(text)
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text: r.text }])
      setTyping(false)
      // Run navigation side-effect after message is appended
      if (typeof r.action === 'function') r.action()
      // If a deepLink is present, push precise route after a short delay to allow navigation
      if (r.deepLink) {
        const { id, date } = r.deepLink
        // ensure we navigate after router is ready
        setTimeout(() => {
          if (date) {
            // date must be in YYYY-MM-DD format per routes
            window.history.pushState({}, '', `/movies/${id}/${date}`)
            window.dispatchEvent(new PopStateEvent('popstate'))
          } else {
            window.history.pushState({}, '', `/movies/${id}`)
            window.dispatchEvent(new PopStateEvent('popstate'))
          }
        }, 50)
      }
    }, 500)
  }

  return (
    <>
      {/* Launcher */}
      <div className={`fixed z-50 bottom-6 right-6 ${open ? 'hidden' : ''}`}>
        <button
          className="bg-primary rounded-full p-4 shadow-lg hover:bg-primary-dull transition flex items-center justify-center"
          aria-label="Open ZineBot"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Panel */}
      {open && (
        <div className="fixed z-50 bottom-6 right-6 w-80 max-w-xs bg-gray-900 rounded-xl shadow-2xl flex flex-col border border-primary animate-fadeIn">
          <div className="flex items-center justify-between p-4 border-b border-primary bg-primary/10 rounded-t-xl">
            <span className="font-bold text-primary flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> {ZINEBOT_NAME}
            </span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-primary" aria-label="Close ZineBot">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-900" style={{ maxHeight: 320 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.from === 'user' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-gray-800 text-gray-100 text-sm animate-pulse">
                  {ZINEBOT_NAME} is typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Composer */}
          <form className="flex items-center gap-2 p-3 border-t border-primary bg-gray-900 rounded-b-xl" onSubmit={(e) => { e.preventDefault(); handleSend() }}>
            <input
              type="text"
              className="flex-1 rounded bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none"
              placeholder="Ask ZineBot to navigate or help book..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={200}
              autoFocus
            />
            <button type="button" onClick={toggleMic} disabled={!recognitionRef.current} className={`rounded-full p-2 transition ${listening ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`} aria-label="Voice input">
              <Mic className="w-5 h-5" />
            </button>
            <button type="submit" className="bg-primary hover:bg-primary-dull text-white rounded-full p-2 transition" disabled={!input.trim()}>
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="px-4 pb-3 pt-2 text-xs text-gray-400">
            <span>Try:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {quickSuggestions.map((s, idx) => (
                <button key={idx} className="bg-gray-800 hover:bg-primary/20 text-primary rounded-full px-3 py-1 text-xs border border-primary/30" onClick={() => setInput(s.text)} type="button">
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-primary">
              <span className="inline-flex items-center gap-1"><Home size={14}/>Home</span>
              <span className="inline-flex items-center gap-1"><Film size={14}/>Movies</span>
              <span className="inline-flex items-center gap-1"><Ticket size={14}/>Bookings</span>
              <span className="inline-flex items-center gap-1"><Heart size={14}/>Favorites</span>
              <span className="inline-flex items-center gap-1"><Calendar size={14}/>Showtime</span>
              <span className="inline-flex items-center gap-1"><LayoutDashboard size={14}/>Admin</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
