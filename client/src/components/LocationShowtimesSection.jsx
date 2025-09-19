import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const theaters = [
  {
    id: 1,
    name: 'PVR Cinemas, Indiranagar',
    address: '100 Feet Road, Bengaluru',
    shows: [
      { movie: 'Deadpool & Wolverine', time: '12:30 PM' },
      { movie: 'Avatar: The Seed Bearer', time: '3:45 PM' },
      { movie: 'Fantastic Four', time: '7:00 PM' },
    ],
  },
  {
    id: 2,
    name: 'INOX, Garuda Mall',
    address: 'Magrath Road, Bengaluru',
    shows: [
      { movie: 'The Batman: Part II', time: '1:15 PM' },
      { movie: 'Deadpool & Wolverine', time: '5:00 PM' },
    ],
  },
  {
    id: 3,
    name: 'Cinepolis, Royal Meenakshi Mall',
    address: 'Bannerghatta Road, Bengaluru',
    shows: [
      { movie: 'Avatar: The Seed Bearer', time: '11:00 AM' },
      { movie: 'Fantastic Four', time: '2:30 PM' },
      { movie: 'The Batman: Part II', time: '6:00 PM' },
    ],
  },
];

const LocationShowtimesSection = () => (
  <section className="mt-20 px-6 md:px-16 lg:px-36 xl:px-44">
    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2"><MapPin className="w-6 h-6 text-primary" /> Showtimes Near You</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {theaters.map(theater => (
        <div key={theater.id} className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 flex flex-col gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{theater.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{theater.address}</p>
          </div>
          <div className="flex flex-col gap-2">
            {theater.shows.map((show, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                <span className="font-medium text-white flex-1 truncate">{show.movie}</span>
                <span className="flex items-center gap-1 text-primary font-semibold"><Clock className="w-4 h-4" /> {show.time}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default LocationShowtimesSection;
