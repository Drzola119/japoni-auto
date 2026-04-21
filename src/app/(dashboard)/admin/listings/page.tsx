'use client';

export const dynamic = 'force-dynamic';

import { Car, CheckCircle, Clock } from 'lucide-react';

const mockListings = [
  { id: 'AN-889', title: 'Audi RS6 Avant', seller: 'Elite Cars', price: '2,800,000 DZD', status: 'pending', date: 'Maintentant' },
  { id: 'AN-888', title: 'Mercedes G63 AMG', seller: 'Luxury Motors', price: '4,500,000 DZD', status: 'active', date: 'Hier' },
  { id: 'AN-887', title: 'Range Rover SV', seller: 'Japoni Imports', price: '3,900,000 DZD', status: 'rejected', date: 'Il y a 2j' },
];

export default function AdminListings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold font-cormorant text-white">Modération des Annonces</h1>
        <p className="text-white/50 text-sm mt-1">Approuvez ou rejetez les annonces avant leur publication publique.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111116] border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs uppercase mb-1">En attente de modération</p>
            <p className="text-2xl font-bold text-amber-500">24</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500/20" />
        </div>
        <div className="bg-[#111116] border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs uppercase mb-1">Approuvées ce jour</p>
            <p className="text-2xl font-bold text-emerald-500">18</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500/20" />
        </div>
        <div className="bg-[#111116] border border-white/5 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs uppercase mb-1">Total actives</p>
            <p className="text-2xl font-bold text-white">3,890</p>
          </div>
          <Car className="w-8 h-8 text-white/10" />
        </div>
      </div>

      {/* Pending Queue */}
      <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden mt-6">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="font-semibold text-white">File d&apos;attente</h2>
        </div>
        
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-[#0a0a0f] text-xs uppercase text-white/50 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Annonce</th>
              <th className="px-6 py-4">Vendeur</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockListings.map(listing => (
              <tr key={listing.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white">{listing.title}</div>
                  <div className="text-xs text-[#C9A84C]">{listing.id}</div>
                </td>
                <td className="px-6 py-4">{listing.seller}</td>
                <td className="px-6 py-4 font-medium">{listing.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                    listing.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                    listing.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition">Inspecter</button>
                  {listing.status === 'pending' && (
                    <button className="text-xs bg-emerald-500/20 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition">Valider</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
