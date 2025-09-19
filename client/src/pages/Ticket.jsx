import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Ticket = () => {
  const { id } = useParams()
  const location = useLocation()
  const { image_base_url } = useAppContext()
  const [booking, setBooking] = useState(location.state?.booking || null)
  const [qrOk, setQrOk] = useState(false)
  const canvasRef = useRef(null)

  // Persist/retrieve booking for offline viewing
  useEffect(() => {
    if (booking) {
      try { localStorage.setItem(`ticket:${id}`, JSON.stringify(booking)) } catch {}
    } else {
      try {
        const cached = localStorage.getItem(`ticket:${id}`)
        if (cached) setBooking(JSON.parse(cached))
      } catch {}
    }
  }, [id, booking])

  // Try to render QR code via dynamic import; fallback to showing text
  useEffect(() => {
    const run = async () => {
      try {
        const mod = await import(/* webpackIgnore: true */ 'qrcode')
        const QRCode = mod.default || mod
        const canvas = canvasRef.current
        if (!canvas) return
        await QRCode.toCanvas(canvas, `BOOKING:${id}`, { margin: 1, width: 220 })
        setQrOk(true)
      } catch (e) {
        setQrOk(false)
      }
    }
    run()
  }, [id])

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[70vh] flex items-center justify-center'>
      <div className='w-full max-w-md bg-gray-800/70 border border-white/10 rounded-2xl p-6 shadow-2xl'>
        <h1 className='text-xl font-semibold mb-2'>Your Ticket</h1>
        <p className='text-xs text-gray-400 mb-4'>Booking ID: <span className='font-mono'>{id}</span></p>

        <div className='flex items-center justify-center mb-4'>
          <canvas ref={canvasRef} width={220} height={220} className='rounded bg-white p-2'/>
        </div>
        {!qrOk && (
          <p className='text-xs text-yellow-400 text-center mb-2'>QR not generated yet. The code will appear after dependencies are installed. You can still verify with the Booking ID above.</p>
        )}

        {booking ? (
          <div className='text-sm bg-black/20 rounded-lg p-3 border border-white/10'>
            <p className='font-semibold'>{booking.show?.movie?.title || 'Movie'}</p>
            <p className='text-gray-400'>Seats: {booking.bookedSeats?.join(', ')}</p>
            <p className='text-gray-400'>Amount: {booking.amount}</p>
          </div>
        ) : (
          <p className='text-sm text-gray-400 text-center'>Details unavailable offline. Open from My Bookings once online to cache.</p>
        )}
      </div>
    </div>
  )
}

export default Ticket
