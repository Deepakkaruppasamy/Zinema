import React from 'react';
import { useAppContext } from '../context/AppContext';
import MovieCard from './MovieCard';

const RecommendationsSection = () => {
  const { shows } = useAppContext();

  // For demo, pick 4 random movies as recommendations
  const recommendations = shows.slice(0, 4);

  if (!recommendations.length) return null;

  return (
    <section className="px-6 md:px-16 lg:px-36 xl:px-44 mt-20">
      <h2 className="text-2xl font-bold mb-6 text-white">Recommended for You</h2>
      <div className="flex flex-wrap gap-8 max-sm:justify-center">
        {recommendations.map(movie => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </section>
  );
};

export default RecommendationsSection;
