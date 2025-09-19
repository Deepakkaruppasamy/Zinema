import React from 'react';
import Slider from 'react-slick';
import { assets } from '../assets/assets';
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import guardianPoster from '../assets/guardian.png';
import supermanBg from '../assets/superman.jpg';
import ffBg from '../assets/4.jpg';
import cooliBg from '../assets/coolie.jpg';
import supermanLogo from '../assets/logo2.png';
import cooliLogo from '../assets/logo3.png';

const movies = [
  {
    title: 'Fantastic Four: First Steps',
    genres: 'Action | Adventure | Sci-Fi',
    year: '2024',
    duration: '2h 5m',
    description: 'The Fantastic Four unite for the first time to battle a cosmic threat and discover their powers.',
    image: ffBg, // Fantastic Four background
    bg: ffBg, // Fantastic Four background
    logo: assets.marvelLogo, // Marvel Studios logo
  },
  {
    title: 'Superman 2025',
    genres: 'Action | Adventure | Drama',
    year: '2025',
    duration: '2h 15m',
    description: 'Superman returns to face a new threat that puts humanity at risk in the year 2025.',
    image: supermanBg, // Superman background
    bg: supermanBg, // Superman background
    logo: supermanLogo, // Superman logo
  },
  {
    title: 'Fantastic Four: First Steps',
    genres: 'Action | Adventure | Sci-Fi',
    year: '2024',
    duration: '2h 5m',
    description: 'The Fantastic Four unite for the first time to battle a cosmic threat and discover their powers.',
    image: ffBg, // Fantastic Four background
    bg: ffBg, // Fantastic Four background
    logo: assets.marvelLogo, // Marvel Studios logo
  },
  {
    title: 'Guardians of the Galaxy',
    genres: 'Action | Adventure | Sci-Fi',
    year: '2014',
    duration: '2h 1m',
    description: 'A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.',
    image: guardianPoster, // Guardians poster
    bg: guardianPoster, // Guardians background
    logo: assets.marvelLogo, // Marvel Studios logo
  },
  {
    title: 'Cooli (Tamil Movie)',
    genres: 'Comedy | Drama',
    year: '2023',
    duration: '2h 10m',
    description: 'A hilarious journey of a coolie who dreams big and faces the odds in Chennai.',
    image: cooliBg, // Cooli background
    bg: cooliBg, // Cooli background
    logo: cooliLogo, // Cooli logo
  }
];

const HeroSection = () => {
  const navigate = useNavigate();
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <Slider {...settings}>
      {movies.map((movie, idx) => (
        <div key={idx}>
          <div
            className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 h-screen relative'
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.6)), url(${movie.bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <img src={movie.logo} alt="logo" className="max-h-14 lg:h-16 mt-20" />
            <h1 className='text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110'>
              {movie.title.split(' ').map((word, i) =>
                word === 'of' ? <span key={i}><br />{word} </span> : word + ' '
              )}
            </h1>
            <div className='flex items-center gap-4 text-gray-300'>
              <span>{movie.genres}</span>
              <div className='flex items-center gap-1'>
                <CalendarIcon className='w-4.5 h-4.5' /> {movie.year}
              </div>
              <div className='flex items-center gap-1'>
                <ClockIcon className='w-4.5 h-4.5' /> {movie.duration}
              </div>
            </div>
            <p className='max-w-xl text-lg text-gray-200'>{movie.description}</p>
            <button
              className='flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full text-lg font-semibold mt-2 hover:bg-red-700 transition-all'
              onClick={() => navigate('/movies')}
            >
              Explore Movies <ArrowRight size={20} />
            </button>
          </div>
        </div>
      ))}
    </Slider>
  );
}

export default HeroSection;

