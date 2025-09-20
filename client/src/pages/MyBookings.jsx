import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../assets/assets'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { Trophy, Star, Zap, Crown, Target, Award, Gift, Coins, Flame, Calendar, Heart, Eye, CheckCircle, Lock, Unlock, Bell, DollarSign } from 'lucide-react'
import GamificationSystem from '../components/gamification/GamificationSystem'
import DynamicPricingAlerts from '../components/pricing/DynamicPricingAlerts'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const { axios, getToken, user, image_base_url} = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')
  const [userStats, setUserStats] = useState({
    level: 1,
    experience: 0,
    points: 0,
    badges: [],
    achievements: [],
    streak: 0,
    totalBookings: 0,
    totalSpent: 0,
    rank: 'Bronze'
  })

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

  const loadUserStats = async () => {
    try {
      const { data } = await axios.get('/api/user/gamification', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        // Handle both response structures: data.stats or data.gamification
        const stats = data.stats || data.gamification || {};
        setUserStats({
          level: stats.level || 1,
          experience: stats.experience || 0,
          points: stats.points || 0,
          badges: stats.badges || [],
          achievements: stats.achievements || [],
          streak: stats.streak || 0,
          totalBookings: stats.totalBookings || 0,
          totalSpent: stats.totalSpent || 0,
          rank: stats.rank || 'Bronze'
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Keep default values on error
    }
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
      loadUserStats()
    }
    
  },[user])


  return !isLoading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <BlurCircle top="100px" left="100px"/>
      <div>
        <BlurCircle bottom="0px" left="600px"/>
      </div>
      
      {/* Header with Tabs */}
      <div className='flex justify-between items-center mb-6'>
        <div className="flex items-center gap-4">
          <h1 className='text-2xl font-semibold'>My Account</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">{userStats.rank}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full">
              <Trophy className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Level {userStats.level}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">{userStats.points} pts</span>
            </div>
          </div>
        </div>
        <button 
          onClick={getMyBookings}
          className='bg-primary/20 hover:bg-primary/30 px-3 py-1 rounded text-sm transition'
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'bookings'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          My Bookings
        </button>
        <button
          onClick={() => setActiveTab('gamification')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'gamification'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Gamification
          </div>
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'pricing'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Pricing Alerts
          </div>
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
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
      )}

      {/* Gamification Tab */}
      {activeTab === 'gamification' && (
        <GamificationSystem />
      )}

      {/* Pricing Alerts Tab */}
      {activeTab === 'pricing' && (
        <DynamicPricingAlerts />
      )}

    </div>
  ) : <Loading />
}

export default MyBookings
