import 'dotenv/config'
import fetch from 'node-fetch'
import Movie from '../models/Movie.js'
import Show from '../models/Show.js'

// Use a model alias that Google serves consistently on v1beta
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro-latest'

function buildPrompt(messages = [], userProfile = {}) {
  const system = `You are DeepAI, a personalized Gemini-powered assistant for Zinema.
  Core capabilities (Gemini-only, no external browsing):
  1) Show available movies
  2) Show available seats
  3) Recommend movies (general or by genre)
  4) Compare movies
  5) Offer opinions/decision support (pros/cons, which to pick and why)
  6) Site Q&A and navigation help (include <nav target="/path"> when helpful)
  7) General movie knowledge (within your training limits)
  8) Answer general questions outside the app when the user asks (act like Gemini)

  - Be concise and helpful. Prefer bullet points.
  - Never fabricate showtimes or seats; suggest where to check in the app.
  - Keep answers under 150 words.
  - Always include a JSON block fenced with <json> ... </json> that specifies intent and entities.
  - JSON schema:
    {
      "intent": "show_movies | show_seats | recommend_movies | compare_movies | opinions | site_qna | navigate | knowledge | save_preferences | notify_me",
      "entities": {
        "movieTitle": string | null,
        "movieTitles": string[] | null,
        "showId": string | null,
        "genre": string | null,
        "genres": string[] | null,
        "languages": string[] | null,
        "question": string | null,
        "page": string | null,
        "comparisonType": "general" | "detailed" | null,
        "minutesBefore": number | null
      }
    }
  - Put the natural reply first, then the fenced JSON on a new line.
  - For navigation, include an inline tag like <nav target="/favorite"> when relevant.`

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
      // Do not leak upstream 404 to client as route 404; use 502 Bad Gateway
      return res.status(502).json({ error: 'Gemini request failed', detail: text })
    }
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'
    return res.json({ text })
  } catch (e) {
    console.error('DeepAI chat error:', e)
    return res.status(500).json({ error: 'Internal error' })
  }
}

// --- Helper functions for the 4 core functions ---

// 1. Show available movies
async function getAvailableMovies() {
  try {
    // Get movies from local database that have upcoming shows
    const upcomingShows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate('movie')
      .sort({ showDateTime: 1 })
      .lean()
    
    const uniqueMovies = new Map()
    upcomingShows.forEach(show => {
      if (show.movie) {
        uniqueMovies.set(String(show.movie._id), {
          ...show.movie,
          nextShowTime: show.showDateTime,
          showId: show._id
        })
      }
    })
    
    return Array.from(uniqueMovies.values()).slice(0, 20) // Limit to 20 movies
  } catch (error) {
    console.error('Error fetching available movies:', error)
    return []
  }
}

// 2. Show available seats
async function getSeatAvailability(showId) {
  try {
    const show = await Show.findById(showId).populate('movie').lean()
    if (!show) return { available: false, totalSeats: 0, availableSeats: 0, movie: null }
    
    const occupied = show.occupiedSeats || {}
    const totalSeats = 100 // Assuming 100 seats per theater
    const occupiedCount = Object.keys(occupied).length
    const availableSeats = Math.max(0, totalSeats - occupiedCount)
    
    return {
      available: availableSeats > 0,
      totalSeats,
      availableSeats,
      occupiedSeats: occupiedCount,
      movie: show.movie,
      showDateTime: show.showDateTime,
      price: show.showPrice
    }
  } catch (error) {
    console.error('Error fetching seat availability:', error)
    return { available: false, totalSeats: 0, availableSeats: 0, movie: null }
  }
}

// 3. Suggest best movies from internet (Gemini-only, no external browsing)
async function getInternetMovieRecommendations(genre = null) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return []

    const prompt = `Recommend 8 widely loved movies${genre ? ` in the ${genre} genre` : ''}.
Return ONLY a JSON array named movies. Each item must have:
{"title":"string","year":number,"genres":[string],"rating":number,"overview":"string"}`

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${apiKey}`
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!resp.ok) return []
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const match = text.match(/\[([\s\S]*)\]/)
    const jsonStr = match ? `[${match[1]}]` : text
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? parsed.slice(0, 8) : (parsed.movies || []).slice(0, 8)
  } catch (error) {
    console.error('Error fetching Gemini recommendations:', error)
    return []
  }
}

// 4. Compare movies (Gemini-only, no external browsing)
async function compareMovies(movieTitles) {
  try {
    if (!movieTitles || movieTitles.length < 2) {
      return { error: 'Please provide at least 2 movie titles to compare' }
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return { movies: [] }

    const prompt = `Compare these movies side-by-side: ${movieTitles.join(', ')}.
Return ONLY JSON with shape {"movies":[{"title":"string","year":number,"genres":[string],"rating":number,"highlights":["..."],"pros":["..."],"cons":["..."]}]} .`

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${apiKey}`
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!resp.ok) return { movies: [] }
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : text
    const parsed = JSON.parse(jsonStr)
    return { movies: Array.isArray(parsed) ? parsed : parsed.movies || [] }
  } catch (error) {
    console.error('Error comparing movies with Gemini:', error)
    return { error: 'Failed to compare movies' }
  }
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
      return res.status(502).json({ error: 'Gemini request failed', detail: text })
    }
    const data = await resp.json()
    const modelText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsedIntent = extractIntentFromText(modelText)

    let intent = parsedIntent?.intent || 'unknown'
    const entities = parsedIntent?.entities || {}
    let payload = {}

    // Handle intents
    if (intent === 'show_movies') {
      const movies = await getAvailableMovies()
      payload = { movies }
    } else if (intent === 'show_seats') {
      const seatInfo = await getSeatAvailability(entities.showId)
      payload = { seatInfo }
    } else if (intent === 'recommend_movies') {
      const recommendations = await getInternetMovieRecommendations(entities.genre)
      payload = { recommendations }
    } else if (intent === 'compare_movies') {
      const comparison = await compareMovies(entities.movieTitles)
      payload = { comparison }
    } else if (intent === 'opinions') {
      // Gemini-only opinionated guidance
      const apiKey = process.env.GEMINI_API_KEY
      const topic = (messages?.slice(-1)?.[0]?.text || '').slice(0, 500)
      const prompt = `Give a brief opinionated recommendation with pros/cons and a final suggestion about: ${topic}. Return under 100 words.`
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${apiKey}`
      const resp2 = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }) })
      const data2 = await resp2.json().catch(() => ({}))
      const text2 = data2?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      payload = { opinion: text2.trim() }
    } else if (intent === 'site_qna') {
      // Lightweight site Q&A based on keywords
      const q = (entities.question || messages?.slice(-1)?.[0]?.text || '').toLowerCase()
      let answer = ''
      if (q.includes('booking') || q.includes('tickets')) answer = 'Go to Movies → pick a show → select seats → checkout.'
      else if (q.includes('favorites') || q.includes('wishlist')) answer = 'Open Favorites from the top menu to see your saved movies.'
      else if (q.includes('profile') || q.includes('account')) answer = 'Open Profile to manage your details and bookings.'
      else answer = 'Use the navigation bar: Movies, Trending, Favorites, Profile.'
      payload = { answer }
    } else if (intent === 'navigate') {
      const page = entities.page || ''
      const map = { favorites: '/favorite', wishlist: '/favorite', movies: '/movies', trending: '/trending', profile: '/profile' }
      const target = map[page] || '/'
      payload = { nav: { target } }
    } else if (intent === 'knowledge') {
      // General movie knowledge via Gemini
      const apiKey = process.env.GEMINI_API_KEY
      const q = (messages?.slice(-1)?.[0]?.text || '').slice(0, 500)
      const prompt = `Answer briefly (<=100 words): ${q}`
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${apiKey}`
      const resp2 = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }) })
      const data2 = await resp2.json().catch(() => ({}))
      const text2 = data2?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      payload = { answer: text2.trim() }
    } else if (intent === 'save_preferences') {
      // Persist minimal preferences if model provides them (genres/languages)
      try {
        const UserPreferences = (await import('../models/UserPreferences.js')).default
        const userId = user?.id || req.auth?.()?.userId || 'anonymous'
        const pref = await UserPreferences.findOneAndUpdate(
          { userId },
          {
            userId,
            $set: {
              'moviePreferences.genres': entities.genres || [],
              'moviePreferences.languages': entities.languages || []
            }
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        )
        payload = { saved: true, preferences: pref }
      } catch (e) {
        payload = { saved: false }
      }
    } else if (intent === 'notify_me') {
      // Create a lightweight reminder if showId provided
      const minutes = Math.max(5, Number(entities.minutesBefore || 30))
      const showId = entities.showId
      if (!showId) {
        payload = { success: false, message: 'showId required' }
      } else {
        try {
          const Reminder = (await import('../models/Reminder.js')).default
          const ShowModel = (await import('../models/Show.js')).default
          const show = await ShowModel.findById(showId)
          if (!show) {
            payload = { success: false, message: 'Show not found' }
          } else {
            const when = new Date(new Date(show.showDateTime).getTime() - minutes * 60000)
            const reminder = await Reminder.create({
              userId: user?.id || 'anonymous',
              movieId: String(show.movie),
              movieTitle: 'Show reminder',
              reminderType: 'showtime',
              reminderTime: when,
              channel: 'email',
            })
            payload = { success: true, reminder }
          }
        } catch (_) {
          payload = { success: false }
        }
      }
    } else {
      // Fallback: general Q&A via Gemini (act like Gemini)
      const apiKey = process.env.GEMINI_API_KEY
      const q = (messages?.slice(-1)?.[0]?.text || '').slice(0, 1000)
      const prompt = `Answer clearly and concisely (<=120 words): ${q}`
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${apiKey}`
      const resp2 = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }) })
      const data2 = await resp2.json().catch(() => ({}))
      const text2 = data2?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      payload = { answer: text2.trim() }
      intent = 'general_qa'
    }

    const text = modelText.replace(/<json>[\s\S]*?<\/json>/, '').trim() || 'Here is what I found.'
    return res.json({ text, intent, entities, data: payload })
  } catch (e) {
    console.error('DeepAI assistant error:', e)
    return res.status(500).json({ error: 'Internal error' })
  }
}
