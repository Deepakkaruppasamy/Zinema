import { StarIcon, PlayCircleIcon } from 'lucide-react'
import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'
import { useAppContext } from '../context/AppContext'
import TrailerModal from './movie/TrailerModal'
import extractDominantColor from '../lib/extractDominantColor'

const MovieCard = ({movie}) => {

    const navigate = useNavigate()
    const {image_base_url} = useAppContext()
    const [hover, setHover] = useState(false)
    const [tilt, setTilt] = useState({ rX: 0, rY: 0 })
    const cardRef = useRef(null)
    const [trailerOpen, setTrailerOpen] = useState(false)
    const [accent, setAccent] = useState(null)

    const posterUrl = useMemo(() => (
      movie.backdrop_path ? (image_base_url + movie.backdrop_path) : 'https://placehold.co/500x300?text=No+Image'
    ), [movie?.backdrop_path, image_base_url])

    const handleImageError = (e) => {
      e.target.src = 'https://placehold.co/500x300?text=No+Image'
    }

    const onMouseMove = (e) => {
      const el = cardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const rX = (py - 0.5) * -10
      const rY = (px - 0.5) * 10
      setTilt({ rX, rY })
    }

  return (
    <div
      ref={cardRef}
      onMouseEnter={async () => {
        setHover(true)
        if (!accent && posterUrl) {
          const rgb = await extractDominantColor(posterUrl)
          if (rgb) setAccent(rgb)
        }
      }}
      onMouseLeave={() => { setHover(false); setTilt({ rX: 0, rY: 0 }) }}
      onMouseMove={onMouseMove}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rX}deg) rotateY(${tilt.rY}deg)`,
        transformStyle: 'preserve-3d',
        ['--accent'.toString()]: accent ? `rgb(${accent.r}, ${accent.g}, ${accent.b})` : undefined,
        boxShadow: hover && accent ? `0 10px 30px -10px rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.55)` : undefined,
      }}
      className='group flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66 border border-white/5'
    >

      <div className='relative'>
        <img
          onClick={()=> {navigate(`/movies/${movie._id}`); scrollTo(0, 0)}}
          src={posterUrl}
          alt={movie.title}
          className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer transition-all duration-300 group-hover:brightness-105'
          onError={handleImageError}
        />
        {/* Inline trailer preview on hover (muted autoplay) */}
        <div className='absolute inset-0 rounded-lg overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <iframe
            className='w-full h-full scale-[1.02]'
            src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(`${movie.title} official trailer`)}&autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0`}
            title={`${movie.title} trailer preview`}
            allow='autoplay; encrypted-media; picture-in-picture'
          />
        </div>
        {/* Trailer hover overlay */}
        <button
          onClick={() => setTrailerOpen(true)}
          className='absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/35 opacity-0 group-hover:opacity-100 transition'
          aria-label='Play trailer'
        >
          <span className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-gray-900 text-xs font-semibold shadow'>
            <PlayCircleIcon className='w-4 h-4'/>
            Trailer
          </span>
        </button>
      </div>

       <p className='font-semibold mt-2 truncate'>{movie.title}</p>

       <p className='text-sm text-gray-400 mt-2'>
        {new Date(movie.release_date).getFullYear()} • {movie.genres.slice(0,2).map(genre => genre.name).join(" | ")} • {timeFormat(movie.runtime)}
       </p>

       <div className='flex items-center justify-between mt-4 pb-3'>
        <button onClick={()=> {navigate(`/movies/${movie._id}`); scrollTo(0, 0)}} className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>Buy Tickets</button>

        <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
            <StarIcon className="w-4 h-4 text-primary fill-primary"/>
            {Number(movie.vote_average ?? 0).toFixed(1)}
        </p>
       </div>

      {/* Trailer modal reusing YouTube search */}
      <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} title={movie.title} />
    </div>
  )
}

export default MovieCard
