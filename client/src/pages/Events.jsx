import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const API_BASE = '/api/events'

const EventCard = ({ event }) => {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/events/${event._id}`)} className='cursor-pointer bg-gray-900/70 rounded-2xl p-5 border border-gray-800 hover:border-primary/60 transition shadow'>
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className='w-full h-44 object-cover rounded-xl mb-4' />
      )}
      <div className='flex items-center justify-between mb-1'>
        <h3 className='text-lg font-semibold text-white'>{event.title}</h3>
        <span className='text-xs px-2 py-0.5 rounded-full bg-white/10 border border-gray-700'>{event.type}</span>
      </div>
      <p className='text-gray-300 text-sm line-clamp-2 mb-2'>{event.description}</p>
      <div className='flex items-center justify-between text-gray-200 text-sm'>
        <span>{new Date(event.dateTime).toLocaleString()}</span>
        <span className='font-semibold text-primary'>₹{event.price}</span>
      </div>
      <div className='mt-1 text-gray-400 text-xs'>{event.venue}, {event.city}</div>
    </div>
  )
}

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')

  const type = searchParams.get('type') || ''
  const city = searchParams.get('city') || ''
  const q = searchParams.get('q') || ''

  useEffect(() => {
    const controller = new AbortController()
    async function fetchEvents() {
      setLoading(true)
      setError('')
      try {
        const query = new URLSearchParams()
        if (type) query.set('type', type)
        if (city) query.set('city', city)
        if (q) query.set('q', q)
        const res = await fetch(`${API_BASE}/all?${query.toString()}`, { signal: controller.signal })
        const data = await res.json()
        if (!data.success) throw new Error(data.message || 'Failed to load events')
        setEvents(data.events)
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
    return () => controller.abort()
  }, [type, city, q])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className='px-6 md:px-16 lg:px-36 xl:px-44 pt-24'>
      <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Events</h1>
          <p className='text-gray-300'>Stand-up, sports screenings, concerts and special shows.</p>
        </div>
        <div className='flex flex-wrap gap-3'>
          <select value={type} onChange={e => setParam('type', e.target.value)} className='bg-white/10 border border-gray-700 rounded-lg px-3 py-2'>
            <option value=''>All Types</option>
            <option value='standup'>Stand-up</option>
            <option value='sports'>Sports</option>
            <option value='concert'>Concert</option>
            <option value='screening'>Screening</option>
            <option value='other'>Other</option>
          </select>
          <input value={city} onChange={e => setParam('city', e.target.value)} placeholder='City' className='bg-white/10 border border-gray-700 rounded-lg px-3 py-2' />
          <input value={q} onChange={e => setParam('q', e.target.value)} placeholder='Search' className='bg-white/10 border border-gray-700 rounded-lg px-3 py-2' />
        </div>
      </div>

      {loading && <div className='mt-8 text-gray-400'>Loading events...</div>}
      {error && <div className='mt-8 text-red-400'>{error}</div>}

      {!loading && !error && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
          {events.map(ev => (
            <EventCard key={ev._id} event={ev} />
          ))}
          {events.length === 0 && (
            <div className='text-gray-400'>No events found.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default Events


