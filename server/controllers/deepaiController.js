import 'dotenv/config'
import fetch from 'node-fetch'
import Movie from '../models/Movie.js'
import Show from '../models/Show.js'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

function buildPrompt(messages = [], userProfile = {}) {
  const system = `You are DeepAI, a friendly movie and ticket-booking assistant for Zinema.
  - Help users discover films, showtimes, genres, and guide them to book tickets.
  - Be concise and actionable. Offer steps (e.g., "Go to Movies → pick show → select seats").
  - If user intent is navigation (favorites, trending, theatre, my bookings), reply with a short instruction plus a tag like <nav target="/favorite"> so the client can navigate.
  - Never fabricate showtimes; if exact data is needed, suggest where to find it in the app.
  - Personalize lightly with the provided profile if available.
  - Keep responses under 120 words.
  - Also include a JSON block fenced with <json> ... </json> that specifies an intent and entities you extracted.
  - The JSON must follow this schema:
    {
      "intent": "book_tickets | navigate | recommend_by_genre | movie_info | faq | listings",
      "entities": {
        "movieTitle": string | null,
        "genre": string | null,
        "city": string | null,
        "time": string | null,
        "numTickets": number | null,
        "seatType": "Regular" | "Premium" | null,
        "date": string | null
      }
    }
  - Keep natural reply first, then the fenced JSON block on a new line.`

  const history = [
    { role: 'user', parts: [{ text: system }] },
    ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
  ]

  if (userProfile && (userProfile.name || userProfile.email)) {
    history.unshift({ role: 'user', parts: [{ text: `User profile: ${userProfile.name || ''} ${userProfile.email || ''}`.trim() }] })
  }
  return history
}

export async function deepaiChat(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })

    const { messages = [], user = {} } = req.body || {}

    const contents = buildPrompt(messages, user)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${apiKey}`
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      return res.status(resp.status).json({ error: 'Gemini request failed', detail: text })
    }
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'
    return res.json({ text })
  } catch (e) {
    console.error('DeepAI chat error:', e)
    return res.status(500).json({ error: 'Internal error' })
  }
}

// --- Helper resolvers for intents ---
async function findMoviesByGenre(genreName) {
  if (!genreName) return []
  const regex = new RegExp(`^${genreName}$`, 'i')
  const movies = await Movie.find({ 'genres.name': regex }).limit(10).lean()
  return movies
}

async function findMovieByTitle(title) {
  if (!title) return null
  const movie = await Movie.findOne({ title: { $regex: new RegExp(title, 'i') } }).lean()
  return movie
}

async function getUpcomingShowtimes(movieId) {
  if (!movieId) return []
  const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } })
    .sort({ showDateTime: 1 })
    .lean()
  return shows
}

function summarizeShowtimes(shows, city) {
  // City is not modeled; ignore but keep param for future
  const byDate = {}
  shows.forEach(s => {
    const date = new Date(s.showDateTime).toISOString().split('T')[0]
    if (!byDate[date]) byDate[date] = []
    byDate[date].push({ time: s.showDateTime, showId: s._id, price: s.showPrice })
  })
  return byDate
}

async function getSeatAvailabilityAndPrice(showId, requestedSeats = 1) {
  const show = await Show.findById(showId).lean()
  if (!show) return { available: false, price: 0, availableCount: 0 }
  const occupied = show.occupiedSeats || {}
  const totalSeats = 100
  const taken = Object.keys(occupied).length
  const availableCount = Math.max(0, totalSeats - taken)
  const available = availableCount >= requestedSeats
  const price = (show.showPrice || 0) * requestedSeats
  return { available, price, availableCount }
}

function extractIntentFromText(text) {
  try {
    const match = text.match(/<json>[\s\S]*?<\/json>/)
    if (!match) return null
    const jsonStr = match[0].replace(/<json>|<\/json>/g, '').trim()
    const parsed = JSON.parse(jsonStr)
    return parsed
  } catch (_) {
    return null
  }
}

export async function deepaiAssistant(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })

    const { messages = [], user = {} } = req.body || {}

    const contents = buildPrompt(messages, user)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${apiKey}`
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      return res.status(resp.status).json({ error: 'Gemini request failed', detail: text })
    }
    const data = await resp.json()
    const modelText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsedIntent = extractIntentFromText(modelText)

    let intent = parsedIntent?.intent || 'unknown'
    const entities = parsedIntent?.entities || {}
    let payload = {}
    let nav = null

    if (intent === 'recommend_by_genre') {
      const movies = await findMoviesByGenre(entities.genre)
      payload = { movies }
    } else if (intent === 'movie_info') {
      const movie = await findMovieByTitle(entities.movieTitle)
      if (movie) {
        const shows = await getUpcomingShowtimes(movie._id)
        payload = { movie, showtimes: summarizeShowtimes(shows, entities.city) }
      } else {
        payload = { movie: null, showtimes: {} }
      }
    } else if (intent === 'book_tickets') {
      const movie = await findMovieByTitle(entities.movieTitle)
      if (movie) {
        const upcoming = await getUpcomingShowtimes(movie._id)
        // Pick closest matching time if provided
        let chosenShow = null
        if (entities.time) {
          const target = entities.time.toLowerCase()
          chosenShow = upcoming.find(s => new Date(s.showDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase().includes(target)) || null
        }
        chosenShow = chosenShow || upcoming[0] || null
        if (chosenShow) {
          const seatInfo = await getSeatAvailabilityAndPrice(chosenShow._id, Math.max(1, entities.numTickets || 1))
          payload = {
            movie,
            showId: chosenShow._id,
            showDateTime: chosenShow.showDateTime,
            seatInfo
          }
        } else {
          payload = { movie, showId: null, seatInfo: { available: false, price: 0, availableCount: 0 } }
        }
      } else {
        payload = { movie: null }
      }
    } else if (intent === 'navigate') {
      // Basic mapping based on entities
      if (entities?.movieTitle) nav = { target: `/movie/${encodeURIComponent(entities.movieTitle)}` }
    } else if (intent === 'listings') {
      // Return a lightweight list of movies that have upcoming shows
      const upcomingShows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie').limit(50).lean()
      const unique = new Map()
      upcomingShows.forEach(s => { if (s.movie) unique.set(String(s.movie._id), s.movie) })
      payload = { movies: Array.from(unique.values()) }
    } else if (intent === 'faq') {
      // Lightweight FAQ fallback based on common keywords
      const lc = (messages?.slice(-1)?.[0]?.text || '').toLowerCase()
      const faqMap = [
        { k: ['payment', 'methods'], a: 'We accept credit/debit cards and PayPal.' },
        { k: ['refund'], a: 'Refunds are available within 24 hours of booking per our policy.' },
        { k: ['change', 'date'], a: 'You can modify your booking date if seats are available.' },
      ]
      const hit = faqMap.find(f => f.k.every(x => lc.includes(x)))
      payload = hit ? { faqAnswer: hit.a } : {}
    }

    const text = modelText.replace(/<json>[\s\S]*?<\/json>/, '').trim() || 'Here is what I found.'
    return res.json({ text, intent, entities, data: payload, nav })
  } catch (e) {
    console.error('DeepAI assistant error:', e)
    return res.status(500).json({ error: 'Internal error' })
  }
}
