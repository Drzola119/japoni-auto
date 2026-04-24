'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { BadgeCheck, ExternalLink, Phone, ShieldCheck } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { User as UserType } from '@/types';

export default function AdminSellers() {
  const [sellers, setSellers] = useState<UserType[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db!, 'users'), where('role', '==', 'seller'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSellers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as unknown as UserType)));
    });
    return () => unsubscribe();
  }, []);

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db!, 'users', id), { 
        verified: !isVerified,
        verifiedAt: !isVerified ? serverTimestamp() : null
      });
      toast.success(isVerified ? 'Vérification retirée' : 'Vendeur vérifié avec succès');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredSellers = sellers.filter(s => {
    if (filter === 'verified') return s.verified;
    if (filter === 'pending') return !s.verified;
    return true;
  }).filter(s => {
    const matchesSearch = !searchTerm || 
      s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#2A2A2A]">
        <div>
          <h1 className="text-2xl font-serif text-white font-bold">Gestion des Vendeurs</h1>
          <p className="text-[#555555] text-[10px] uppercase tracking-[0.2em] mt-1 font-bold">Vérification et certification</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un vendeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#2A2A2A]">
            {['all', 'verified', 'pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-[#C9A84C] text-[#07070C]' : 'text-[#555555] hover:text-[#A0A0A0]'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'verified' ? 'Vérifiés' : 'En Attente'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredSellers.map((s, i) => (
          <motion.div 
            key={s.uid}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#C9A84C]/30 transition-all flex flex-col lg:flex-row lg:items-center gap-6"
          >
            <div className="flex items-center gap-4 lg:w-1/3">
              <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center text-[#C9A84C] text-2xl font-bold border border-[#2A2A2A] relative">
                {s.displayName?.charAt(0) || 'S'}
                {s.verified && (
                  <div className="absolute -top-2 -right-2 bg-[#C9A84C] text-[#07070C] p-1 rounded-full shadow-[0_0_10px_#C9A84C]">
                    <BadgeCheck size={14} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                  {s.displayName}
                  {s.verified && <span className="text-[10px] text-[#C9A84C] uppercase font-black tracking-widest">Premium</span>}
                </h3>
                <p className="text-xs text-[#555555] mt-1">{s.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:flex lg:flex-1 items-center gap-8 border-t lg:border-t-0 lg:border-l border-[#1E1E1E] pt-6 lg:pt-0 lg:pl-8">
              <div className="space-y-1">
                <p className="text-[10px] text-[#555555] uppercase font-bold tracking-widest">Contact</p>
                <p className="text-xs text-[#A0A0A0] flex items-center gap-2"><Phone size={12} /> {s.phone || '--'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-[#555555] uppercase font-bold tracking-widest">Localisation</p>
                <p className="text-xs text-[#A0A0A0]">{s.wilaya || 'Non spécifiée'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-[#555555] uppercase font-bold tracking-widest">Annonces</p>
                <p className="text-sm text-white font-bold">12</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-[#555555] uppercase font-bold tracking-widest">Membre depuis</p>
                <p className="text-xs text-[#A0A0A0]">{s.createdAt ? formatDate(s.createdAt) : '--'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t lg:border-t-0 pt-6 lg:pt-0">
              <button 
                onClick={() => handleVerify(s.uid, s.verified || false)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  s.verified 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                    : 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 hover:bg-[#C9A84C]/20 shadow-[0_0_15px_rgba(201,168,76,0.1)]'
                }`}
              >
                <ShieldCheck size={16} />
                {s.verified ? 'Révoquer' : 'Vérifier'}
              </button>
              <button className="p-2.5 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-white transition-all border border-[#2A2A2A]">
                <ExternalLink size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}