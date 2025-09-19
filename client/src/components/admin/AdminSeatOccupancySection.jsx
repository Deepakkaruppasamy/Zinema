import React from 'react';
import { Ticket, AlertTriangle } from 'lucide-react';

const shows = [
  {
    id: 1,
    movie: 'Deadpool & Wolverine',
    theater: 'PVR Indiranagar',
    time: '12:30 PM',
    totalSeats: 120,
    booked: 110,
  },
  {
    id: 2,
    movie: 'Avatar: The Seed Bearer',
    theater: 'INOX Garuda Mall',
    time: '3:45 PM',
    totalSeats: 100,
    booked: 40,
  },
  {
    id: 3,
    movie: 'Fantastic Four',
    theater: 'Cinepolis RM Mall',
    time: '7:00 PM',
    totalSeats: 90,
    booked: 88,
  },
  {
    id: 4,
    movie: 'The Batman: Part II',
    theater: 'PVR Indiranagar',
    time: '10:00 PM',
    totalSeats: 120,
    booked: 22,
  },
];

const getOccupancy = (booked, total) => Math.round((booked / total) * 100);

const AdminSeatOccupancySection = () => (
  <section className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 mt-12">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <Ticket className="w-6 h-6 text-primary" /> Real-Time Seat Occupancy
    </h2>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
            <th className="py-2 pr-4">Movie</th>
            <th className="py-2 pr-4">Theater</th>
            <th className="py-2 pr-4">Show Time</th>
            <th className="py-2 pr-4">Booked</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Occupancy</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {shows.map(show => {
            const occupancy = getOccupancy(show.booked, show.totalSeats);
            return (
              <tr key={show.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                <td className="py-3 pr-4 font-medium text-white">{show.movie}</td>
                <td className="py-3 pr-4">{show.theater}</td>
                <td className="py-3 pr-4">{show.time}</td>
                <td className="py-3 pr-4">{show.booked}</td>
                <td className="py-3 pr-4">{show.totalSeats}</td>
                <td className="py-3 pr-4">
                  <div className="w-28 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${occupancy > 80 ? 'bg-red-500' : occupancy > 50 ? 'bg-yellow-400' : 'bg-green-500'}`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-300 ml-2">{occupancy}%</span>
                </td>
                <td className="py-3">
                  {occupancy > 90 ? (
                    <span className="flex items-center gap-1 text-red-500 font-semibold text-xs"><AlertTriangle className="w-4 h-4" /> Almost Full</span>
                  ) : occupancy < 30 ? (
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold text-xs">Slow Sales</span>
                  ) : (
                    <span className="text-green-400 font-semibold text-xs">Normal</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

export default AdminSeatOccupancySection;
