import React from 'react';
import { Upload, Download, Edit2 } from 'lucide-react';

const movies = [
  { id: 1, title: 'Deadpool & Wolverine', genre: 'Action', release: '2025-07-25', shows: 12 },
  { id: 2, title: 'Avatar: The Seed Bearer', genre: 'Sci-Fi', release: '2025-12-18', shows: 8 },
  { id: 3, title: 'Fantastic Four', genre: 'Superhero', release: '2025-11-07', shows: 6 },
  { id: 4, title: 'The Batman: Part II', genre: 'Action', release: '2025-10-03', shows: 10 },
];

const AdminBulkMovieShowSection = () => (
  <section className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 mt-12">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <Edit2 className="w-6 h-6 text-primary" /> Bulk Movie & Show Management
    </h2>
    <div className="flex gap-4 mb-6">
      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dull transition">
        <Upload className="w-5 h-5" /> Import CSV/Excel
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-primary border border-primary rounded-lg font-semibold hover:bg-primary/10 transition">
        <Download className="w-5 h-5" /> Export CSV
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Genre</th>
            <th className="py-2 pr-4">Release Date</th>
            <th className="py-2 pr-4">Shows</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map(movie => (
            <tr key={movie.id} className="border-b border-gray-800 hover:bg-gray-800/40">
              <td className="py-3 pr-4 font-medium text-white">{movie.title}</td>
              <td className="py-3 pr-4">{movie.genre}</td>
              <td className="py-3 pr-4">{movie.release}</td>
              <td className="py-3 pr-4">{movie.shows}</td>
              <td className="py-3">
                <button className="px-3 py-1 bg-primary/90 text-white rounded-md text-xs font-bold hover:bg-primary">Edit</button>
                <button className="ml-2 px-3 py-1 bg-red-500/80 text-white rounded-md text-xs font-bold hover:bg-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default AdminBulkMovieShowSection;
