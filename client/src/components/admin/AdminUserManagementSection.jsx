import React from 'react';
import { User, Search, Shield, Ban, RefreshCw } from 'lucide-react';

const users = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@zinema.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Priya Singh', email: 'priya@zinema.com', role: 'Staff', status: 'Active' },
  { id: 3, name: 'Rahul Verma', email: 'rahul@zinema.com', role: 'Support', status: 'Banned' },
  { id: 4, name: 'Sneha Patel', email: 'sneha@zinema.com', role: 'User', status: 'Active' },
];

const AdminUserManagementSection = () => (
  <section className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 mt-12">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <User className="w-6 h-6 text-primary" /> User Management & Moderation
    </h2>
    <div className="flex items-center gap-4 mb-6">
      <div className="relative w-full max-w-xs">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-primary"
        />
        <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
      </div>
      <select className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-primary">
        <option value="">All Roles</option>
        <option value="Admin">Admin</option>
        <option value="Staff">Staff</option>
        <option value="Support">Support</option>
        <option value="User">User</option>
      </select>
      <select className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-primary">
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="Banned">Banned</option>
      </select>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/40">
              <td className="py-3 pr-4 font-medium text-white">{user.name}</td>
              <td className="py-3 pr-4">{user.email}</td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'Admin' ? 'bg-primary/60 text-white' : 'bg-gray-700 text-gray-200'}`}>{user.role}</span>
              </td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'Active' ? 'bg-green-600/50 text-green-200' : 'bg-red-600/40 text-red-200'}`}>{user.status}</span>
              </td>
              <td className="py-3 flex gap-2">
                <button className="px-3 py-1 bg-primary/90 text-white rounded-md text-xs font-bold hover:bg-primary flex items-center gap-1"><Shield className="w-4 h-4" /> Edit Role</button>
                <button className="px-3 py-1 bg-red-500/80 text-white rounded-md text-xs font-bold hover:bg-red-600 flex items-center gap-1"><Ban className="w-4 h-4" /> Ban</button>
                <button className="px-3 py-1 bg-gray-700 text-white rounded-md text-xs font-bold hover:bg-primary/40 flex items-center gap-1"><RefreshCw className="w-4 h-4" /> Reset PW</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default AdminUserManagementSection;
