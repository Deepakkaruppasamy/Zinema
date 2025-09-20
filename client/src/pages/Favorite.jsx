import React, { useState } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'
import WishlistReminders from '../components/wishlist/WishlistReminders'
import { Heart, Bell, Star } from 'lucide-react'

const Favorite = () => {
  const {favoriteMovies, user} = useAppContext()
  const [activeTab, setActiveTab] = useState('favorites')

  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px"/>
      <BlurCircle bottom="50px" right="50px"/>

      {/* Header with Tabs */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold'>My Collection</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Star className="w-4 h-4" />
            Favorites ({favoriteMovies.length})
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'wishlist'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Heart className="w-4 h-4" />
              Wishlist & Reminders
            </button>
          )}
        </div>
      </div>

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <>
          {favoriteMovies.length > 0 ? (
            <div className='flex flex-wrap max-sm:justify-center gap-8'>
              {favoriteMovies.map((movie)=> (
                <MovieCard movie={movie} key={movie._id}/>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-20'>
              <Star className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className='text-2xl font-bold text-center mb-2'>No favorites yet</h2>
              <p className="text-gray-400 text-center">Start adding movies to your favorites to see them here</p>
            </div>
          )}
        </>
      )}

      {/* Wishlist & Reminders Tab */}
      {activeTab === 'wishlist' && user && (
        <WishlistReminders />
      )}

      {activeTab === 'wishlist' && !user && (
        <div className='flex flex-col items-center justify-center py-20'>
          <Heart className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className='text-2xl font-bold text-center mb-2'>Sign in required</h2>
          <p className="text-gray-400 text-center">Please sign in to access your wishlist and reminders</p>
        </div>
      )}
    </div>
  )
}

export default Favorite

