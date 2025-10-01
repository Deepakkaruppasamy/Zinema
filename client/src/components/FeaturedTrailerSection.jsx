import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';

const TRAILER_THUMB = 'https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg'; // The Batman
const TRAILER_URL = 'https://www.youtube-nocookie.com/embed/mqqft2x_Aa4?autoplay=1&modestbranding=1&rel=0&playsinline=1'; // The Batman Official Trailer

const FeaturedTrailerSection = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-20 px-6 md:px-16 lg:px-36 xl:px-44">
      <h2 className="text-2xl font-bold mb-6 text-white">Featured Trailer</h2>
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-gray-800 aspect-video bg-black">
        {!open && (
          <>
            <img src={TRAILER_THUMB} alt="Featured Trailer" className="w-full h-full object-cover object-center" />
            <button
              className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/30 hover:bg-black/50 transition"
              onClick={() => setOpen(true)}
              aria-label="Play Trailer"
            >
              <PlayCircle className="w-20 h-20 text-primary drop-shadow-xl" />
            </button>
          </>
        )}
        {open && (
          <iframe
            className="w-full h-full min-h-[320px]"
            src={TRAILER_URL}
            title="Featured Trailer"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="autoplay; encrypted-media; picture-in-picture"
            frameBorder="0"
            referrerPolicy="origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
      <div className="mt-4 text-gray-300 text-center">
        <span className="font-semibold">The Batman</span> - Official Trailer
      </div>
    </section>
  );
};

export default FeaturedTrailerSection;
