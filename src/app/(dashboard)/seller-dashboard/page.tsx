'use client';

export const dynamic = 'force-dynamic';

import { Car, Eye, MessageSquare, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function SellerOverview() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-cormorant text-white tracking-wide">Mon Showroom</h1>
          <p className="text-white/50 text-sm mt-1">Gérez vos véhicules, analysez vos performances et répondez à vos clients.</p>
        </div>
        <Link href="/seller-dashboard/listings/new" className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all">
          <Plus size={18} /> Nouvelle Annonce
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="text-white/50 text-sm font-medium uppercase tracking-wider text-[11px]">En Vitrine</div>
            <Car className="text-[#C9A84C] opacity-50" size={20} />
          </div>
          <div className="text-3xl font-semibold text-white">14</div>
        </div>
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="text-white/50 text-sm font-medium uppercase tracking-wider text-[11px]">Vues (30j)</div>
            <Eye className="text-white/20" size={20} />
          </div>
          <div className="text-3xl font-semibold text-white">12.4k</div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">+15% vs le mois dernier</div>
        </div>
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="text-white/50 text-sm font-medium uppercase tracking-wider text-[11px]">Messages non lus</div>
            <MessageSquare className="text-amber-500 opacity-50" size={20} />
          </div>
          <div className="text-3xl font-semibold text-amber-500">5</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a24] to-[#111116] border border-[#C9A84C]/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <Star size={120} className="text-[#C9A84C] -mt-10 -mr-10" />
          </div>
          <div className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Statut du compte</div>
          <div className="text-white font-semibold flex items-center gap-2 relative z-10">
            Vendeur Vérifié <CheckCircle size={16} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-6">Derniers Messages</h2>
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white/90 text-sm">Concernant: Golf 8 R-Line</h4>
                <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase font-bold">Nouveau</span>
              </div>
              <p className="text-sm text-white/60 line-clamp-2">Bonjour, je suis très intéressé par la voiture. Est-il possible de venir la voir ce weekend ?</p>
            </div>
            <Link href="/seller-dashboard/inquiries" className="text-xs text-center font-medium text-[#C9A84C] hover:text-[#E8C96A] transition-colors mt-2">
              Voir tous les messages
            </Link>
          </div>
        </div>

        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-6">Annonces Performantes</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="w-16 h-12 bg-black rounded-lg border border-white/10 overflow-hidden relative shrink-0">
                <Image src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a" alt="car" fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white/90 text-sm transition-colors">Mercedes G63 AMG</h4>
                <p className="text-xs text-[#C9A84C] font-semibold mt-1">45,000,000 DZD</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">4.2k vues</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

function CheckCircle({ className, size }: { className?: string, size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
