import 'dotenv/config'
import fetch from 'node-fetch'
import Movie from '../models/Movie.js'
import Show from '../models/Show.js'
import { getNowPlayingMovies, getMovieDetails, makeTmdbRequest } from '../utils/tmdbApi.js'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

function buildPrompt(messages = [], userProfile = {}) {
  const system = `You are DeepAI, a specialized movie assistant for Zinema with only 4 core functions:
  1. Show available movies - Display movies currently playing in theaters
  2. Show available seats - Check seat availability for specific shows
  3. Suggest best movies from internet - Provide movie recommendations using online data
  4. Compare movies - Compare two or more movies side by side

  - Be concise and helpful. Focus only on these 4 functions.
  - For movie recommendations, use current internet data and trends.
  - For comparisons, highlight key differences in plot, cast, ratings, and genres.
  - Keep responses under 150 words.
  - Also include a JSON block fenced with <json> ... </json> that specifies an intent and entities you extracted.
  - The JSON must follow this schema:
    {
      "intent": "show_movies | show_seats | recommend_movies | compare_movies",
      "entities": {
        "movieTitle": string | null,
        "movieTitles": string[] | null,
        "showId": string | null,
        "genre": string | null,
        "comparisonType": "general | detailed" | null
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

// 3. Suggest best movies from internet
async function getInternetMovieRecommendations(genre = null) {
  try {
    let endpoint = '/movie/popular'
    if (genre) {
      endpoint = `/discover/movie?with_genres=${genre}&sort_by=popularity.desc`
    }
    
    const response = await makeTmdbRequest(endpoint)
    const movies = response.results?.slice(0, 10) || []
    
    // Get additional details for each movie
    const detailedMovies = await Promise.all(
      movies.map(async (movie) => {
        try {
          const details = await getMovieDetails(movie.id)
          return {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            releaseDate: movie.release_date,
            rating: movie.vote_average,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            genres: details.genres || [],
            runtime: details.runtime,
            tagline: details.tagline
          }
        } catch (error) {
          console.error(`Error fetching details for movie ${movie.id}:`, error)
          return {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            releaseDate: movie.release_date,
            rating: movie.vote_average,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            genres: [],
            runtime: null,
            tagline: null
          }
        }
      })
    )
    
    return detailedMovies
  } catch (error) {
    console.error('Error fetching internet movie recommendations:', error)
    return []
  }
}

// 4. Compare movies
async function compareMovies(movieTitles) {
  try {
    if (!movieTitles || movieTitles.length < 2) {
      return { error: 'Please provide at least 2 movie titles to compare' }
    }
    
    const movieDetails = await Promise.all(
      movieTitles.map(async (title) => {
        try {
          // First search for the movie
          const searchResponse = await makeTmdbRequest(`/search/movie?query=${encodeURIComponent(title)}`)
          const movie = searchResponse.results?.[0]
          
          if (!movie) {
            return { title, found: false, error: 'Movie not found' }
          }
          
          // Get detailed information
          const details = await getMovieDetails(movie.id)
          return {
            title: details.title,
            originalTitle: details.original_title,
            overview: details.overview,
            releaseDate: details.release_date,
            rating: details.vote_average,
            voteCount: details.vote_count,
            posterPath: details.poster_path,
            backdropPath: details.backdrop_path,
            genres: details.genres || [],
            runtime: details.runtime,
            tagline: details.tagline,
            budget: details.budget,
            revenue: details.revenue,
            status: details.status,
            found: true
          }
        } catch (error) {
          console.error(`Error fetching movie ${title}:`, error)
          return { title, found: false, error: error.message }
        }
      })
    )
    
    return { movies: movieDetails }
  } catch (error) {
    console.error('Error comparing movies:', error)
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
      return res.status(resp.status).json({ error: 'Gemini request failed', detail: text })
    }
    const data = await resp.json()
    const modelText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsedIntent = extractIntentFromText(modelText)

    let intent = parsedIntent?.intent || 'unknown'
    const entities = parsedIntent?.entities || {}
    let payload = {}

    // Handle the 4 core functions only
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
      } else {
      // Default response for unrecognized intents
      payload = { message: 'I can only help with: showing available movies, checking seat availability, recommending movies from the internet, and comparing movies.' }
    }

    const text = modelText.replace(/<json>[\s\S]*?<\/json>/, '').trim() || 'Here is what I found.'
    return res.json({ text, intent, entities, data: payload })
  } catch (e) {
    console.error('DeepAI assistant error:', e)
    return res.status(500).json({ error: 'Internal error' })
  }
}
