'use client';

import { ShieldCheck, FileCheck, XCircle, Users } from 'lucide-react';

const mockSellers = [
  { id: 1, showroom: 'Luxury Motors DZ', owner: 'Amine K.', activeListings: 14, status: 'pending', requestedAt: 'Aujourd\'hui' },
  { id: 2, showroom: 'Japoni Imports', owner: 'Rafik M.', activeListings: 42, status: 'approved', requestedAt: 'Fév 2026' },
  { id: 3, showroom: 'Elite Cars Alger', owner: 'Mounir S.', activeListings: 8, status: 'approved', requestedAt: 'Nov 2025' },
];

export default function SellersManagement() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cormorant text-white">Validation Vendeurs</h1>
          <p className="text-white/50 text-sm mt-1">Gérez les demandes de comptes professionnels et showrooms.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Pending Requests */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-2">Demandes en attente (1)</h2>
          {mockSellers.filter(s => s.status === 'pending').map(seller => (
            <div key={seller.id} className="bg-[#111116] border border-[#C9A84C]/30 rounded-2xl p-6 relative">
              <div className="absolute top-0 right-0 w-2 h-full bg-[#C9A84C] rounded-r-2xl" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{seller.showroom}</h3>
                  <p className="text-sm text-white/50">Propriétaire: {seller.owner}</p>
                </div>
                <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded font-medium">À VERIFIER</span>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-emerald-600">
                  <FileCheck size={16} /> Approuver le showroom
                </button>
                <button className="bg-white/5 text-white/80 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-white/10">
                  <XCircle size={16} /> Rejeter
                </button>
              </div>
            </div>
          ))}

          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mt-8 mb-2">Vendeurs Vérifiés</h2>
          <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden">
            {mockSellers.filter(s => s.status === 'approved').map((seller, index) => (
              <div key={seller.id} className={`p-4 flex items-center justify-between ${index !== 0 ? 'border-t border-white/5' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#C9A84C]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{seller.showroom}</h4>
                    <p className="text-xs text-white/40">{seller.owner} • Approuvé en {seller.requestedAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{seller.activeListings}</div>
                  <div className="text-[10px] uppercase text-white/40 tracking-wider">Annonces</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col - Stats widget */}
        <div className="space-y-6">
          <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Métrique Pro</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-white/60">Contrôles en attente</span>
                <span className="font-bold text-amber-500">1</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-white/60">Vendeurs actifs</span>
                <span className="font-bold text-emerald-500">142</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Refus (Ce mois)</span>
                <span className="font-bold text-white/80">3</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
