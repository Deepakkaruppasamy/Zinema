import React from 'react';
import { Gift, Plus, Edit, Trash2 } from 'lucide-react';

const promotions = [
  { id: 1, code: 'WELCOME50', desc: '50% off for new users', uses: 120, active: true, expires: '2025-09-01' },
  { id: 2, code: 'SUMMER20', desc: '20% off on all tickets', uses: 75, active: true, expires: '2025-08-31' },
  { id: 3, code: 'FESTIVE10', desc: '10% off for Diwali', uses: 40, active: false, expires: '2025-11-15' },
];

const AdminPromotionsSection = () => (
  <section className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 mt-12">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <Gift className="w-6 h-6 text-primary" /> Promotions & Coupon Management
    </h2>
    <div className="flex gap-4 mb-6">
      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dull transition">
        <Plus className="w-5 h-5" /> Add Promotion
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
            <th className="py-2 pr-4">Code</th>
            <th className="py-2 pr-4">Description</th>
            <th className="py-2 pr-4">Uses</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Expires</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map(promo => (
            <tr key={promo.id} className="border-b border-gray-800 hover:bg-gray-800/40">
              <td className="py-3 pr-4 font-mono font-bold text-primary">{promo.code}</td>
              <td className="py-3 pr-4">{promo.desc}</td>
              <td className="py-3 pr-4">{promo.uses}</td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${promo.active ? 'bg-green-600/50 text-green-200' : 'bg-red-600/40 text-red-200'}`}>{promo.active ? 'Active' : 'Inactive'}</span>
              </td>
              <td className="py-3 pr-4">{promo.expires}</td>
              <td className="py-3 flex gap-2">
                <button className="px-3 py-1 bg-primary/90 text-white rounded-md text-xs font-bold hover:bg-primary flex items-center gap-1"><Edit className="w-4 h-4" /> Edit</button>
                <button className="px-3 py-1 bg-red-500/80 text-white rounded-md text-xs font-bold hover:bg-red-600 flex items-center gap-1"><Trash2 className="w-4 h-4" /> Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default AdminPromotionsSection;
