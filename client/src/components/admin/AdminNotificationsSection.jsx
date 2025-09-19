import React from 'react';
import { Bell, Send, Clock } from 'lucide-react';

const announcements = [
  { id: 1, message: 'Flash Sale: 30% off all tickets today only!', target: 'All Users', status: 'Sent', time: '2025-08-08 09:00' },
  { id: 2, message: 'New release: The Batman now showing!', target: 'Movie Fans', status: 'Scheduled', time: '2025-08-09 10:00' },
  { id: 3, message: 'App update: Try our new mobile app for exclusive offers.', target: 'All Users', status: 'Sent', time: '2025-08-07 18:00' },
];

const AdminNotificationsSection = () => (
  <section className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 mt-12">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <Bell className="w-6 h-6 text-primary" /> Push Notifications & Announcements
    </h2>
    <form className="flex flex-col md:flex-row gap-4 mb-8">
      <input
        type="text"
        placeholder="Write an announcement..."
        className="flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-primary"
      />
      <select className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-primary">
        <option value="All Users">All Users</option>
        <option value="Movie Fans">Movie Fans</option>
        <option value="App Users">App Users</option>
      </select>
      <input
        type="datetime-local"
        className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dull transition"
      >
        <Send className="w-5 h-5" /> Send
      </button>
    </form>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
            <th className="py-2 pr-4">Message</th>
            <th className="py-2 pr-4">Target</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Time</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map(a => (
            <tr key={a.id} className="border-b border-gray-800 hover:bg-gray-800/40">
              <td className="py-3 pr-4 font-medium text-white">{a.message}</td>
              <td className="py-3 pr-4">{a.target}</td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${a.status === 'Sent' ? 'bg-green-600/50 text-green-200' : 'bg-yellow-400/30 text-yellow-900'}`}>{a.status}</span>
              </td>
              <td className="py-3 pr-4 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {a.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default AdminNotificationsSection;
