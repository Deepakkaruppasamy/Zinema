import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { CalendarDays, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock upcoming releases data
const upcomingMovies = [
  {
    id: 1,
    title: 'Avatar: The Seed Bearer',
    releaseDate: '2025-12-18',
    poster: 'https://image.tmdb.org/t/p/w500/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg',
  },
  {
    id: 2,
    title: 'Deadpool & Wolverine',
    releaseDate: '2025-07-25',
    poster: 'https://image.tmdb.org/t/p/w500/4qPz6GhNATPlFz7z0t7m4f4U1Yu.jpg',
  },
  {
    id: 3,
    title: 'Fantastic Four',
    releaseDate: '2025-11-07',
    poster: 'https://image.tmdb.org/t/p/w500/6agKYU5IQFpuDyUYPu39w7UCRrJ.jpg',
  },
  {
    id: 4,
    title: 'The Batman: Part II',
    releaseDate: '2025-10-03',
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
  },
];

const ArrowBtn = ({ onClick, dir }) => (
  <button
    onClick={onClick}
    aria-label={dir === 'left' ? 'Previous' : 'Next'}
    className={`absolute z-10 top-1/2 -translate-y-1/2 ${dir === 'left' ? '-left-4 md:-left-8' : '-right-4 md:-right-8'}
      p-2 md:p-3 rounded-full bg-white/10 border border-white/15 backdrop-blur hover:bg-white/20 transition
      text-white shadow-lg`}
  >
    {dir === 'left' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
  </button>
);

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  arrows: true,
  autoplay: true,
  autoplaySpeed: 4000,
  nextArrow: <ArrowBtn dir="right" />,
  prevArrow: <ArrowBtn dir="left" />,
  accessibility: true,
  focusOnSelect: false,
  pauseOnFocus: true,
  pauseOnHover: true,
  responsive: [
    { breakpoint: 1280, settings: { slidesToShow: 3 } },
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 1 } },
  ],
};

const SkeletonCard = () => (
  <div className="px-2">
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm h-[360px] animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
    </div>
  </div>
);

const UpcomingReleasesSection = () => {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // Simulate async fetch when using mock data so we can show skeletons
    const t = setTimeout(() => {
      setMovies(upcomingMovies);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const handleNotify = (title) => {
    toast.success(`We'll notify you about ${title}`);
  };

  return (
    <section className="relative mt-20 px-6 md:px-16 lg:px-24 xl:px-36">
      {/* Soft gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[80%] rounded-full blur-3xl opacity-30 bg-gradient-to-r from-primary/30 via-fuchsia-500/20 to-sky-500/20" />
      </div>

      {/* Section header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80">Don’t miss what’s next</p>
          <h2 className="mt-1 text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Upcoming Releases
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
          <CalendarDays className="w-4 h-4" />
          Updated daily from TMDB
        </div>
      </div>

      <div className="relative">
        <Slider {...settings}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`s-${i}`} />)
            : movies.map((movie) => (
            <div key={movie.id} className="px-2">
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition duration-300">
                <div className="relative h-[360px]">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://placehold.co/300x450?text=No+Poster';
                    }}
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                  {/* Badge */}
                  <span className="absolute left-3 top-3 rounded-full bg-primary/20 text-primary border border-primary/30 px-3 py-1 text-[11px] font-semibold tracking-wide">
                    Coming Soon
                  </span>

                  {/* Bottom content */}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-bold text-white text-lg line-clamp-2 drop-shadow">{movie.title}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-200 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        {new Date(movie.releaseDate).toLocaleDateString()}
                      </p>
                      <button onClick={() => handleNotify(movie.title)} className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-black hover:bg-primary-dull transition">
                        <Bell className="w-3.5 h-3.5" /> Notify me
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default UpcomingReleasesSection;
