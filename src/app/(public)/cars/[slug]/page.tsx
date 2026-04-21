'use client';

export const dynamic = 'force-dynamic';

import { CheckCircle2, ChevronRight, Gauge, Heart, MapPin, MessageSquare, Phone, Share2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CarDetailPage() {
  // In a real app we would fetch the car using `params.slug`
  return (
    <div className="min-h-screen bg-[#07070A] text-white pt-20 overflow-x-hidden">
      
      {/* Breadcrumb */}
      <div className="border-b border-white/5">
        <div className="container mx-auto px-4 max-w-7xl py-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <ChevronRight size={12} />
          <Link href="/cars" className="hover:text-white transition-colors">Catalogue</Link>
          <ChevronRight size={12} />
          <span className="text-[#C9A84C]">Mercedes-Benz G63 AMG</span>
        </div>
      </div>

      {/* Hero Gallery Base */}
      <div className="w-full bg-black relative">
        <div className="aspect-[16/7] md:aspect-[21/9] relative overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=2000&q=80" alt="Mercedes G63" fill className="object-cover opacity-90" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070A] via-transparent to-transparent" />
          
          <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-rose-500 hover:bg-black/60 transition-all">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 max-w-7xl -mt-20 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Info (Left Col) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111116] border border-white/5 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 rounded-md text-[10px] font-bold uppercase tracking-widest">Premium</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold uppercase tracking-widest text-white/70">Occasion (Excellent)</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-cormorant leading-tight mb-2">Mercedes-Benz G63 AMG</h1>
              <div className="text-3xl font-bold text-[#E8C96A] font-inter mb-8">45,000,000 DZD</div>
              
              {/* Quick Specs Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-white/5">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Année</span>
                  <span className="text-base md:text-lg font-semibold">2024</span>
                </div>
                <div className="flex flex-col gap-2 md:border-l md:pl-4 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Kilométrage</span>
                  <span className="text-base md:text-lg font-semibold flex items-center gap-2"><Gauge size={16} className="text-[#C9A84C] w-4 h-4"/> 5,000 km</span>
                </div>
                <div className="flex flex-col gap-2 md:border-l md:pl-4 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Boîte</span>
                  <span className="text-base md:text-lg font-semibold">Auto (9G)</span>
                </div>
                <div className="flex flex-col gap-2 md:border-l md:pl-4 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Carburant</span>
                  <span className="text-base md:text-lg font-semibold">Essence (V8)</span>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold font-cormorant mb-4">Description</h3>
                <p className="text-white/60 leading-relaxed font-inter text-sm whitespace-pre-line">
                  Véhicule d&apos;exception en état strictement neuf. Entretien exclusif réseau Mercedes-Benz. Configuration très riche.
                  
                  • Pack AMG Night Extérieur
                  • Jantes forgées AMG 22 pouces
                  • Échappement Performance AMG
                  • Intérieur Cuir Nappa Exclusif Noir
                  • Sound System Burmester 3D
                  • Toit ouvrant électrique
                  • Pack d&apos;assistance à la conduite Plus
                  
                  Véhicule disponible de suite, visite sur rendez-vous.
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Seller Card (Right Col) */}
          <div className="space-y-6">
            <div className="bg-[#111116] border border-[#C9A84C]/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C] opacity-5 rounded-bl-full blur-2xl" />
              
              <h3 className="text-xs uppercase font-bold tracking-widest text-[#C9A84C] mb-6 flex items-center gap-2">
                <ShieldCheck size={16} /> Vendeur Professionnel
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center font-cormorant text-2xl font-bold text-white">
                  LM
                </div>
                <div>
                  <h4 className="font-bold text-lg">Luxury Motors DZ</h4>
                  <div className="flex items-center gap-1.5 text-xs text-white/50 mt-1 uppercase tracking-wider font-semibold">
                    <MapPin size={12} className="text-[#C9A84C]" /> Hydra, Alger
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-[#E8C96A] text-[#111] font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-lg">
                  <Phone size={18} /> Afficher le numéro
                </button>
                <button className="w-full bg-white/5 border border-white/10 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                  <MessageSquare size={18} /> Envoyer un message
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 text-center text-[11px] text-white/40 uppercase tracking-wider font-semibold">
                Membre vérifié depuis Janvier 2026
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
                <Share2 size={16} /> Partager l&apos;annonce
              </button>
              <div className="w-px h-4 bg-white/10"></div>
              <button className="flex items-center gap-2 text-sm text-white/40 hover:text-rose-400 transition-colors">
                <CheckCircle2 size={16} /> Signaler
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
