'use client';

import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { CAR_BRANDS } from '@/types';

export default function NewListing() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-20">
      
      <div>
        <h1 className="text-3xl font-bold font-cormorant text-white">Publier un véhicule</h1>
        <p className="text-white/50 text-sm mt-1">Remplissez les détails pour mettre votre véhicule en vitrine.</p>
      </div>

      <form className="space-y-8">
        
        {/* Photos Section */}
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Photos du véhicule</h2>
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 hover:border-[#C9A84C]/50 transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C9A84C]/10 transition-colors">
              <UploadCloud className="text-white/40 group-hover:text-[#C9A84C] transition-colors" size={28} />
            </div>
            <p className="text-sm font-semibold text-white/80">Cliquez pour ajouter des photos</p>
            <p className="text-xs text-white/40 mt-2">La première photo sera la couverture (Format paysage recommandé)</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-4">Informations Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Titre de l'annonce</label>
              <input type="text" placeholder="Ex: Mercedes G63 AMG Edition 1" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Prix (DZD)</label>
              <input type="number" placeholder="Ex: 45000000" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Marque</label>
              <select className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors">
                <option value="" disabled selected>Sélectionnez une marque</option>
                {CAR_BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Modèle</label>
              <input type="text" placeholder="Ex: Classe G" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors" />
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-4">Spécifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Année</label>
              <input type="number" placeholder="Ex: 2024" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Kilométrage (km)</label>
              <input type="number" placeholder="Ex: 15000" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Carburant</label>
              <select className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]">
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybride">Hybride</option>
                <option value="electrique">Électrique</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Boîte de vitesse</label>
              <select className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]">
                <option value="automatique">Automatique</option>
                <option value="manuelle">Manuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">État</label>
              <select className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]">
                <option value="neuf">Neuf</option>
                <option value="occasion">Excellent (Occasion)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Couleur extérieure</label>
              <input type="text" placeholder="Ex: Noir Obsidienne" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Description</label>
            <textarea rows={5} placeholder="Décrivez le véhicule, ses options et ses caractéristiques..." className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] resize-none"></textarea>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
          <button type="button" className="px-6 py-3 rounded-xl text-sm font-bold text-white/50 hover:text-white transition-colors">
            Enregistrer comme brouillon
          </button>
          <button type="button" className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all">
            <CheckCircle2 size={18} /> Soumettre l&apos;annonce
          </button>
        </div>

      </form>
    </div>
  );
}
