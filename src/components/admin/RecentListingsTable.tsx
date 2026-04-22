'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { CarListing } from '@/types';

export default function RecentListingsTable() {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db!, 'listings'), orderBy('createdAt', 'desc'), limit(8));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as CarListing)));
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db!, 'listings', id), { status });
      toast.success(status === 'approved' ? 'Annonce approuvée' : 'Annonce rejetée');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredListings = listings.filter(l => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/20 uppercase tracking-wider">En Attente</span>;
      case 'approved': return <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20 uppercase tracking-wider">Approuvé</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-full border border-red-500/20 uppercase tracking-wider">Rejeté</span>;
      default: return <span className="px-2 py-1 bg-[#2A2A2A] text-[#A0A0A0] text-[10px] font-bold rounded-full uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-white font-serif text-lg font-semibold border-l-2 border-[#C9A84C] pl-3">
          Dernières Annonces
        </h3>
        
        <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#2A2A2A]">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                filter === f ? 'bg-[#C9A84C] text-[#07070C]' : 'text-[#555555] hover:text-[#A0A0A0]'
              }`}
            >
              {f === 'all' ? 'Tout' : f === 'pending' ? 'Attente' : f === 'approved' ? 'Approuvé' : 'Rejeté'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#161616] text-[10px] uppercase tracking-[0.15em] text-[#555555] font-bold border-b border-[#1E1E1E]">
              <th className="px-6 py-4">Photo</th>
              <th className="px-6 py-4">Véhicule</th>
              <th className="px-6 py-4">Vendeur</th>
              <th className="px-6 py-4 text-right">Prix</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E1E1E]">
            {filteredListings.map((l, i) => (
              <motion.tr 
                key={l.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-[#1A1A1A] transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="w-12 h-8 rounded-lg overflow-hidden relative border border-[#2A2A2A] group-hover:border-[#C9A84C]/40 transition-colors">
                    <Image 
                      src={l.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100&q=40'} 
                      alt={l.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-[#F5F0E8] font-bold line-clamp-1">{l.title}</p>
                  <p className="text-xs text-[#555555] mt-0.5 uppercase tracking-tighter">{l.wilaya}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-[#A0A0A0] font-medium">{l.sellerName || 'Vendeur'}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-sm text-[#C9A84C] font-bold">{formatPrice(l.price)}</p>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(l.status || 'pending')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1.5 rounded-lg bg-[#2A2A2A] text-[#A0A0A0] hover:text-white transition-all">
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={() => updateStatus(l.id, 'approved')}
                      disabled={l.status === 'approved'}
                      className="p-1.5 rounded-lg bg-[#2A2A2A] text-[#A0A0A0] hover:text-green-500 transition-all disabled:opacity-30"
                    >
                      <CheckCircle size={14} />
                    </button>
                    <button 
                      onClick={() => updateStatus(l.id, 'rejected')}
                      disabled={l.status === 'rejected'}
                      className="p-1.5 rounded-lg bg-[#2A2A2A] text-[#A0A0A0] hover:text-red-500 transition-all disabled:opacity-30"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        {filteredListings.length === 0 && (
          <div className="py-20 text-center text-[#555555] text-sm italic">
            Aucune annonce trouvée
          </div>
        )}
      </div>
    </div>
  );
}
