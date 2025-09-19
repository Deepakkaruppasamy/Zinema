import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import TrailerModal from '../components/movie/TrailerModal'
import SimilarMoviesCarousel from '../components/movie/SimilarMoviesCarousel'
import ReviewsSection from '../components/movie/ReviewsSection'
import extractDominantColor from '../lib/extractDominantColor'

const MovieDetails = () => {

  const navigate = useNavigate()
  const {id} = useParams()
  const [show, setShow] = useState(null)

  const {shows, axios, getToken, user, fetchFavoriteMovies, favoriteMovies, image_base_url} = useAppContext()
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [accent, setAccent] = useState(null)

  const getShow = async ()=>{
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if(data.success){
        setShow(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleFavorite = async ()=>{
    try {
      if(!user) return toast.error("Please login to proceed");

      const { data } = await axios.post('/api/user/update-favorite', {movieId: id}, {headers: { Authorization: `Bearer ${await getToken()}` }})

      if(data.success){
        await fetchFavoriteMovies()
        toast.success(data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  useEffect(()=>{
    getShow()
  },[id])

  // Extract dominant color once show is loaded
  useEffect(() => {
    const run = async () => {
      try {
        const url = show?.movie?.poster_path ? (image_base_url + show.movie.poster_path) : null
        if (!url) return setAccent(null)
        const rgb = await extractDominantColor(url)
        if (!rgb) return setAccent(null)
        setAccent(rgb)
      } catch (_) {
        setAccent(null)
      }
    }
    run()
  }, [show, image_base_url])

  return show ? (
    <div
      className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50 relative'
      style={accent ? { ['--accent'.toString()]: `rgb(${accent.r}, ${accent.g}, ${accent.b})` } : undefined}
    >
      {/* Backdrop hero */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${image_base_url + show.movie.backdrop_path})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900" />
      </div>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>

        <img src={image_base_url + show.movie.poster_path} alt="" className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover border border-white/10 shadow-xl'/>

        <div className='relative flex flex-col gap-3'>
          <BlurCircle top="-100px" left="-100px"/>
          <p className='uppercase tracking-wider text-xs' style={{ color: accent ? 'var(--accent)' : undefined }}>Now Showing</p>
          <h1 className='text-4xl md:text-5xl font-extrabold max-w-3xl bg-clip-text text-transparent'
              style={{ backgroundImage: accent ? 'linear-gradient(90deg, var(--accent), rgba(255,255,255,0.7))' : undefined }}>
            {show.movie.title}
          </h1>
          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className="w-5 h-5 text-primary fill-primary"/>
            {(show.userRating?.avg ?? show.movie.vote_average?.toFixed?.(1) ?? '0.0')} Avg • {(show.userRating?.count ?? 0)} reviews
          </div>

          <p className='text-gray-300/90 mt-2 text-sm leading-relaxed max-w-2xl'>{show.movie.overview}</p>

          <p>
            {timeFormat(show.movie.runtime)} • {show.movie.genres.map(genre => genre.name).join(", ")} • {show.movie.release_date.split("-")[0]}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button onClick={() => setTrailerOpen(true)} className='flex items-center gap-2 px-7 py-3 text-sm bg-white/10 hover:bg-white/15 border border-white/15 transition rounded-md font-semibold cursor-pointer active:scale-95 backdrop-blur'>
              <PlayCircleIcon className="w-5 h-5"/>
              Watch Trailer
              </button>
            <a href="#dateSelect" className='px-10 py-3 text-sm transition rounded-md font-medium cursor-pointer active:scale-95'
               style={{ backgroundColor: accent ? 'var(--accent)' : undefined }}>
              Buy Tickets
            </a>
            <button onClick={handleFavorite} className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
              <Heart className={`${favoriteMovies.find(movie => movie._id === id) ? 'fill-primary text-primary' : ""} w-5 h-5`}/>
            </button>
          </div>
        </div>
      </div>

      <p className='text-lg font-medium mt-20'>Top Cast</p>
      <div className='overflow-x-auto no-scrollbar mt-6 pb-2'>
        <div className='flex items-center gap-4 w-max px-4'>
          {show.movie.casts.slice(0,12).map((cast,index)=> (
            <div key={index} className='flex flex-col items-center text-center'>
              <img src={image_base_url + cast.profile_path} alt="" className='rounded-full h-20 md:h-20 aspect-square object-cover border border-white/10 shadow'/>
              <p className='font-medium text-xs mt-3 text-gray-200'>{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <DateSelect dateTime={show.dateTime} id={id}/>

      <ReviewsSection
        movieId={id}
        user={user}
        axios={axios}
        getToken={getToken}
        initialReviews={show.reviews || []}
      />

      <p className='text-lg font-medium mt-20 mb-6'>You May Also Like</p>
      <SimilarMoviesCarousel baseMovie={show.movie} allShows={shows} />
      <div className='flex justify-center mt-20'>
          <button onClick={()=> {navigate('/movies'); scrollTo(0,0)}} className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Show more</button>
      </div>

      <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} title={show.movie.title} />

    </div>
  ) : <Loading />
}

export default MovieDetails
