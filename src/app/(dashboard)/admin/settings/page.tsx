'use client';

export const dynamic = 'force-dynamic';

import { Settings, Save, Globe } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-bold font-cormorant text-white">Paramètres Plateforme</h1>
        <p className="text-white/50 text-sm mt-1">Configurez les règles globales de la marketplace Japoni Auto.</p>
      </div>

      <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Globe className="text-[#C9A84C]" />
          <h2 className="text-lg font-semibold text-white">Général</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Nom de la plateforme</label>
              <input type="text" defaultValue="Japoni Auto" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#C9A84C]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Email de contact (Support)</label>
              <input type="email" defaultValue="support@japoniauto.dz" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#C9A84C]" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Settings className="text-[#C9A84C]" />
          <h2 className="text-lg font-semibold text-white">Règles de Modération</h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A84C]"></div>
            </div>
            <span className="text-sm text-white/80">Approbation automatique pour les Vendeurs Pro vérifiés</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A84C]"></div>
            </div>
            <span className="text-sm text-white/80">Suspendre l&apos;annonce après 3 signalements consécutifs</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Save size={18} /> Sauvegarder les modifications
        </button>
      </div>

    </div>
  );
}
