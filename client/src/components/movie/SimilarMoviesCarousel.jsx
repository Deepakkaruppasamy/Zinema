import React, { useMemo } from 'react';
import Slider from 'react-slick';
import MovieCard from '../MovieCard';

const arrowBtn = 'absolute z-10 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur rounded-full p-2 text-white';

const NextArrow = ({ onClick }) => (
  <button aria-label="Next" onClick={onClick} className={`${arrowBtn} -right-4`}>›</button>
);
const PrevArrow = ({ onClick }) => (
  <button aria-label="Previous" onClick={onClick} className={`${arrowBtn} -left-4`}>‹</button>
);

const SimilarMoviesCarousel = ({ baseMovie, allShows }) => {
  const similar = useMemo(() => {
    if (!baseMovie) return [];
    const genreSet = new Set(baseMovie.genres.map(g => g.name));
    return allShows
      .filter(m => m._id !== baseMovie._id && m.genres.some(g => genreSet.has(g.name)))
      .slice(0, 12);
  }, [baseMovie, allShows]);

  const settings = {
    dots: false,
    infinite: similar.length > 6,
    speed: 400,
    slidesToShow: 6,
    slidesToScroll: 2,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 5 } },
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 640, settings: { slidesToShow: 2 } },
    ],
  };

  if (similar.length === 0) return null;

  return (
    <div className="relative">
      <Slider {...settings}>
        {similar.map(m => (
          <div key={m._id} className="px-2">
            <MovieCard movie={m} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SimilarMoviesCarousel;
