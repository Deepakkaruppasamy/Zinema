import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../assets/assets'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const { axios, getToken, user, image_base_url} = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getMyBookings = async () =>{
    try {
      const {data} = await axios.get('/api/user/bookings', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
        if (data.success) {
          setBookings(data.bookings)
          console.log('Bookings fetched:', data.bookings.map(b => ({ id: b._id, isPaid: b.isPaid })))
        }

    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  // Auto-refresh every 30 seconds to catch webhook updates
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      getMyBookings();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  useEffect(()=>{
    if(user){
      getMyBookings()
    }
    
  },[user])


  return !isLoading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <BlurCircle top="100px" left="100px"/>
      <div>
        <BlurCircle bottom="0px" left="600px"/>
      </div>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-lg font-semibold'>My Bookings</h1>
        <button 
          onClick={getMyBookings}
          className='bg-primary/20 hover:bg-primary/30 px-3 py-1 rounded text-sm transition'
        >
          Refresh
        </button>
      </div>

      {bookings.map((item,index)=>(
        <div key={index} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
          <div className='flex flex-col md:flex-row'>
            <img src={image_base_url + item.show.movie.poster_path} alt="" className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded'/>
            <div className='flex flex-col p-4'>
              <p className='text-lg font-semibold'>{item.show.movie.title}</p>
              <p className='text-gray-400 text-sm'>{timeFormat(item.show.movie.runtime)}</p>
              <p className='text-gray-400 text-sm mt-auto'>{dateFormat(item.show.showDateTime)}</p>
            </div>
          </div>

          <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
            <div className='flex items-center gap-4'>
              <p className='text-2xl font-semibold mb-3'>{currency}{item.amount}</p>
              <div className='flex flex-col gap-2'>
                {item.isPaid ? (
                  <span className='bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium'>
                    ✓ Paid
                  </span>
                ) : (
                  <Link to={item.paymentLink} className='bg-primary px-4 py-1.5 text-sm rounded-full font-medium cursor-pointer'>
                    Pay Now
                  </Link>
                )}
                {item._id && (
                  <Link
                    to={`/ticket/${item._id}`}
                    state={{ booking: item }}
                    className='px-4 py-1.5 text-sm rounded-full font-medium cursor-pointer border border-white/15 hover:bg-white/10 transition'
                  >
                    View Ticket
                  </Link>
                )}
              </div>
            </div>
            <div className='text-sm'>
              <p><span className='text-gray-400'>Total Tickets:</span> {item.bookedSeats.length}</p>
              <p><span className='text-gray-400'>Seat Number:</span> {item.bookedSeats.join(", ")}</p>
            </div>
          </div>

        </div>
      ))}

    </div>
  ) : <Loading />
}

export default MyBookings
