import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]

  const {id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [expiresAt, setExpiresAt] = useState(null)
  const timerRef = useRef(null)

  const navigate = useNavigate()

  const {axios, getToken, user} = useAppContext();

  const getShow = async () =>{
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.success){
        setShow(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSeatClick = (e, seatId) =>{
      if (!selectedTime) {
        return toast("Please select time first")
      }
      if(!selectedSeats.includes(seatId) && selectedSeats.length > 4){
        return toast("You can only select 5 seats")
      }
      if(occupiedSeats.includes(seatId)){
        return toast('This seat is already booked')
      }
      // Start countdown on first selection
      setExpiresAt(prev => prev || new Date(Date.now() + 10 * 60 * 1000))

      const isShift = e && (e.shiftKey || e.metaKey)
      if (!isShift) {
        setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId])
        return
      }

      // Bulk select within the same row between last selected and current
      const row = seatId[0]
      const lastInRow = [...selectedSeats].reverse().find(s => s[0] === row)
      if (!lastInRow) {
        setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId])
        return
      }
      const a = parseInt(lastInRow.slice(1), 10)
      const b = parseInt(seatId.slice(1), 10)
      const [start, end] = a <= b ? [a, b] : [b, a]
      const range = Array.from({ length: end - start + 1 }, (_, i) => `${row}${start + i}`)
      const blocked = range.some(s => occupiedSeats.includes(s))
      if (blocked) {
        return toast('One or more seats in range are already booked')
      }
      const next = new Set(selectedSeats)
      range.forEach(s => {
        if (next.has(s)) {
          next.delete(s)
        } else if (next.size < 5) {
          next.add(s)
        }
      })
      setSelectedSeats([...next])
  }

  const renderSeats = (row, count = 9)=>(
    <div key={row} className="flex gap-2 mt-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: count }, (_, i) => {
                    const seatId = `${row}${i + 1}`;
                    return (
                        <button key={seatId} onClick={(e) => handleSeatClick(e, seatId)} className={`h-8 w-8 rounded border border-primary/60 cursor-pointer transition-all duration-150
                         hover:shadow-[0_0_0_2px_rgba(248,69,101,0.3)] hover:scale-105 active:scale-95
                         ${selectedSeats.includes(seatId) && "bg-primary text-white shadow-[0_6px_18px_rgba(248,69,101,0.45)]"} 
                         ${occupiedSeats.includes(seatId) && "opacity-50"}`}>
                            {seatId}
                        </button>
                    );
                })}
            </div>
        </div>
  )

  const getOccupiedSeats = async ()=>{
    try {
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`)
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }


  const bookTickets = async ()=>{
    try {
      if(!user) return toast.error('Please login to proceed')

        if(!selectedTime || !selectedSeats.length) return toast.error('Please select a time and seats');

        // Small pre-success confetti for delightful feedback
        runConfetti()

        const {data} = await axios.post('/api/booking/create', {showId: selectedTime.showId, selectedSeats}, {headers: { Authorization: `Bearer ${await getToken()}` }});

        if (data.success){
          window.location.href = data.url;
        }else{
          toast.error(data.message)
        }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    getShow()
  },[])

  useEffect(()=>{
    if(selectedTime){
      getOccupiedSeats()
    }
  },[selectedTime])

  // Countdown timer effect
  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      if (new Date() >= expiresAt) {
        setSelectedSeats([])
        setExpiresAt(null)
        if (timerRef.current) clearInterval(timerRef.current)
        toast('Seat hold expired. Please reselect seats.')
      }
    }
    timerRef.current = setInterval(tick, 1000)
    return () => timerRef.current && clearInterval(timerRef.current)
  }, [expiresAt])

  // Lightweight confetti (no deps)
  const confettiRef = useRef(null)
  const runConfetti = () => {
    const c = document.createElement('canvas')
    c.width = window.innerWidth
    c.height = window.innerHeight
    c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999'
    document.body.appendChild(c)
    confettiRef.current = c
    const ctx = c.getContext('2d')
    const N = 120
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * c.width,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      s: Math.random() * 6 + 4,
      color: `hsl(${Math.random()*360},90%,60%)`,
      a: 1,
      life: Math.random()*60 + 60,
    }))
    let frame = 0
    const tick = () => {
      frame++
      ctx.clearRect(0,0,c.width,c.height)
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 1; p.a = Math.max(0, p.life/120)
        ctx.globalAlpha = p.a
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.s, p.s)
      })
      if (frame < 120) requestAnimationFrame(tick)
      else { document.body.removeChild(c); confettiRef.current = null }
    }
    requestAnimationFrame(tick)
  }

  const timeLeft = useMemo(() => {
    if (!expiresAt) return null
    const ms = Math.max(0, expiresAt.getTime() - Date.now())
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }, [expiresAt])

  return show ? (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
      {/* Available Timings */}
      <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30'>
        <p className='text-lg font-semibold px-6'>Available Timings</p>
        <div className='mt-5 space-y-1'>
          {show.dateTime[date].map((item)=>(
            <div key={item.time} onClick={()=> setSelectedTime(item)} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"}`}>
              <ClockIcon className="w-4 h-4"/>
              <p className='text-sm'>{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seats Layout */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
          <BlurCircle top="-100px" left="-100px"/>
          <BlurCircle bottom="0" right="0"/>
          <h1 className='text-2xl font-semibold mb-2'>Select your seat</h1>
          {/* Accessibility Legend and Timer */}
          <div className='flex flex-col items-center gap-2 mb-4'>
            {timeLeft && (
              <div className='text-sm text-red-300'>Hold expires in: <span className='font-semibold'>{timeLeft}</span></div>
            )}
            <div className='flex items-center gap-4 text-xs'>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 rounded border border-primary/60'></span>
                <span>Available</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 rounded border border-primary/60 bg-primary'></span>
                <span>Selected</span>
              </div>
              <div className='flex items-center gap-2 opacity-50'>
                <span className='h-4 w-4 rounded border border-primary/60 bg-gray-400'></span>
                <span>Booked</span>
              </div>
              <div className='text-[11px] text-gray-400'>(Tip: Shift-click to bulk select within a row)</div>
            </div>
          </div>
          <img src={assets.screenImage} alt="screen" />
          <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>

          <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
              <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
                {groupRows[0].map(row => renderSeats(row))}
              </div>

               <div className='grid grid-cols-2 gap-11'>
                {groupRows.slice(1).map((group, idx)=>(
                  <div key={idx}>
                    {group.map(row => renderSeats(row))}
                  </div>
                ))}
              </div>
          </div>

          <button onClick={bookTickets} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
            Proceed to Checkout
            <ArrowRightIcon strokeWidth={3} className="w-4 h-4"/>
          </button>

         
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default SeatLayout
