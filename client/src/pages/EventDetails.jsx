import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API_CONFIG from '../config/api'

const API_BASE = `${API_CONFIG.API_URL}/events`

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function fetchEvent() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/${id}`, { signal: controller.signal })
        const contentType = res.headers.get('content-type') || ''
        if (!res.ok || !contentType.includes('application/json')) {
          const text = await res.text()
          throw new Error('Failed to load event')
        }
        const data = await res.json()
        if (!data.success) throw new Error(data.message || 'Failed to load event')
        setEvent(data.event)
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
    return () => controller.abort()
  }, [id])

  if (loading) return <div className='px-6 md:px-16 lg:px-36 xl:px-44 pt-24 text-gray-400'>Loading...</div>
  if (error) return <div className='px-6 md:px-16 lg:px-36 xl:px-44 pt-24 text-red-400'>{error}</div>
  if (!event) return null

  return (
    <div className='px-6 md:px-16 lg:px-36 xl:px-44 pt-24'>
      <button onClick={() => navigate(-1)} className='mb-4 text-sm text-gray-300 hover:text-white'>&larr; Back</button>
      <div className='bg-gray-900/70 rounded-2xl p-6 md:p-10 border border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='md:col-span-1'>
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title} className='w-full rounded-xl object-cover' />
          )}
        </div>
        <div className='md:col-span-2'>
          <div className='flex items-center gap-3 mb-2'>
            <h1 className='text-3xl font-bold text-white'>{event.title}</h1>
            <span className='text-xs px-2 py-0.5 rounded-full bg-white/10 border border-gray-700'>{event.type}</span>
          </div>
          <div className='text-gray-300 mb-4'>{event.description}</div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-200'>
            <div>
              <div className='text-gray-400 text-sm'>Date & Time</div>
              <div className='font-medium'>{new Date(event.dateTime).toLocaleString()}</div>
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Venue</div>
              <div className='font-medium'>{event.venue}, {event.city}</div>
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Price</div>
              <div className='font-medium text-primary'>₹{event.price}</div>
            </div>
          </div>
          <div className='mt-6'>
            <button className='px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-md font-medium'>Book Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails


