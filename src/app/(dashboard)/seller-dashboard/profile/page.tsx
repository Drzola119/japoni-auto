'use client';

export const dynamic = 'force-dynamic';

import { Save, Store, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


export default function SellerProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-bold font-cormorant text-white">Profil du Showroom</h1>
        <p className="text-white/50 text-sm mt-1">Personnalisez l&apos;image de votre enseigne auprès des acheteurs.</p>
      </div>

      <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Store className="text-[#C9A84C]" />
          <h2 className="text-lg font-semibold text-white">Informations Générales</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-2xl border border-white/10 bg-black flex items-center justify-center text-4xl text-white/20 uppercase">
              {user?.displayName?.charAt(0) || 'L'}
            </div>
            <div>
              <button className="bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors mb-2">Modifier le logo</button>
              <p className="text-[10px] text-white/40">Taille recommandée : 400x400px (JPG, PNG)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-white/50 mb-2">Nom du Showroom</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" defaultValue={user?.displayName || ''} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-white/50 mb-2">Email de Contact</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" defaultValue={user?.email || ''} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" disabled />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-white/50 mb-2">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="tel" placeholder="0550 00 00 00" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-white/50 mb-2">Localisation (Wilaya)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <select className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]">
                  <option value="16">16 - Alger</option>
                  <option value="31">31 - Oran</option>
                  <option value="09">09 - Blida</option>
                  <option value="25">25 - Constantine</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all">
          <Save size={18} /> Mettre à jour
        </button>
      </div>

    </div>
  );
}
