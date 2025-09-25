import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import API_CONFIG from '../config/api'
import toast from 'react-hot-toast'

const API_BASE = `${API_CONFIG.API_URL}/events`
const API_REGS = `${API_CONFIG.API_URL}/event-registrations`

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [tickets, setTickets] = useState(1)

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

  const handleRegistration = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to register for events')
      return
    }

    if (!event) return

    setRegistering(true)
    try {
      const token = await getToken()
      const registrationData = {
        event: event._id,
        userId: user.id,
        name: user.fullName || user.firstName + ' ' + user.lastName,
        email: user.primaryEmailAddress.emailAddress,
        tickets: tickets,
        amountPaid: event.price * tickets,
        status: 'registered'
      }

      const res = await fetch(API_REGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(registrationData)
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Successfully registered for the event!')
        // Optionally redirect to a confirmation page or show success message
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

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
            <div className='flex items-center gap-4 mb-4'>
              <label className='text-gray-300'>Tickets:</label>
              <select 
                value={tickets} 
                onChange={(e) => setTickets(Number(e.target.value))}
                className='bg-white/10 border border-gray-700 rounded px-3 py-2 text-white'
              >
                {[1,2,3,4,5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <span className='text-gray-300'>Total: ₹{event.price * tickets}</span>
            </div>
            <button 
              onClick={handleRegistration}
              disabled={registering}
              className='px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {registering ? 'Registering...' : 'Register Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails


