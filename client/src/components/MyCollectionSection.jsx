import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import MovieCard from './MovieCard';

const MyCollectionSection = () => {
  const { favoriteMovies, fetchFavoriteMovies, user } = useAppContext();

  useEffect(() => {
    if (user) fetchFavoriteMovies();
  }, [user, fetchFavoriteMovies]);

  if (!user) return null; // show only for signed-in users

  return (
    <section className="px-6 md:px-16 lg:px-36 xl:px-44 mt-16">
      <h2 className="text-2xl font-bold mb-6 text-white">My Collection</h2>
      {favoriteMovies?.length ? (
        <div className="flex flex-wrap gap-8 max-sm:justify-center">
          {favoriteMovies.map(movie => (
            <MovieCard movie={movie} key={movie._id} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400">No items in your collection yet</div>
      )}
    </section>
  );
};

export default MyCollectionSection;
