'use client';

import { Edit2, Eye, MoreVertical, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const mockMyListings = [
  { id: '1', title: 'Mercedes G63 AMG Black Series', price: '45,000,000 DZD', date: 'Maintentant', status: 'active', views: 420 },
  { id: '2', title: 'Range Rover Sport P530', price: '38,000,000 DZD', date: 'Hier', status: 'pending', views: 0 },
  { id: '3', title: 'Audi RSQ8', price: '35,000,000 DZD', date: '10 Mars', status: 'sold', views: 8900 },
];

export default function MyListings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cormorant text-white">Mes Annonces</h1>
          <p className="text-white/50 text-sm mt-1">Gérez votre flotte et vos publications.</p>
        </div>
        <Link href="/seller-dashboard/listings/new" className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90">
          <Plus size={18} /> Ajouter
        </Link>
      </div>

      <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-[#0a0a0f] text-[10px] uppercase tracking-wider text-white/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Véhicule</th>
                <th className="px-6 py-4 font-semibold">Prix</th>
                <th className="px-6 py-4 font-semibold">Vues</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockMyListings.map(listing => (
                <tr key={listing.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded bg-black border border-white/10 hidden sm:block"></div>
                      <div>
                        <div className="font-semibold text-white/90">{listing.title}</div>
                        <div className="text-xs text-white/40 mt-0.5">Mis à jour: {listing.date}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#C9A84C]">{listing.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-white/60">
                      <Eye size={14} /> {listing.views}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      listing.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      listing.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-white/5 text-white/40' // Sold
                    }`}>
                      {listing.status === 'sold' ? 'VENDU' : listing.status === 'pending' ? 'EN ATTENTE' : 'EN LIGNE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button className="text-rose-500/50 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
