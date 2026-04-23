'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Edit2, Eye, Plus, Trash2, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CarListing } from '@/types';
import toast from 'react-hot-toast';

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) return;
    
    const q = query(
      collection(db, 'listings'),
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as CarListing)));
      setLoading(false);
    });
    
    return () => unsub();
  }, [user]);

  const renewListing = async (listingId: string) => {
    setRenewingId(listingId);
    try {
      const days = user?.role === 'showroom' ? 60 : 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      
      await updateDoc(doc(db!, 'listings', listingId), {
        isExpired: false,
        expiresAt: expiresAt.toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('Annonce renouvelée avec succès');
    } catch (error) {
      console.error('Error renewing:', error);
      toast.error('Erreur lors du renouvellement');
    } finally {
      setRenewingId(null);
    }
  };

  const getExpiryInfo = (listing: CarListing) => {
    if (!listing.expiresAt) return { daysLeft: 999, isExpiringSoon: false, isExpired: false };
    
    const expiresAt = new Date(listing.expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000);
    
    return {
      daysLeft,
      isExpiringSoon: daysLeft <= 3 && daysLeft > 0,
      isExpired: daysLeft <= 0,
    };
  };

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
        {loading ? (
          <div className="p-12 text-center text-white/40">Chargement...</div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/40 mb-4">Vous n'avez pas encore d'annonces</p>
            <Link href="/seller-dashboard/listings/new" className="text-[#C9A84C] hover:underline">
              Créer votre première annonce
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-[#0a0a0f] text-[10px] uppercase tracking-wider text-white/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-semibold">Véhicule</th>
                  <th className="px-6 py-4 font-semibold">Prix</th>
                  <th className="px-6 py-4 font-semibold">Vues</th>
                  <th className="px-6 py-4 font-semibold">Expiration</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {listings.map(listing => {
                  const { daysLeft, isExpiringSoon, isExpired } = getExpiryInfo(listing);
                  
                  return (
                    <tr key={listing.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded bg-black border border-white/10 overflow-hidden relative">
                            {listing.images?.[0] ? (
                              <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <div className="font-semibold text-white/90">{listing.title}</div>
                            <div className="text-xs text-white/40 mt-0.5">{listing.year} · {listing.mileage?.toLocaleString()} km</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#C9A84C]">
                        {listing.price?.toLocaleString()} DZD
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-white/60">
                          <Eye size={14} /> {listing.viewCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="text-white/40 text-xs">Expirée</span>
                        ) : isExpiringSoon ? (
                          <span className="text-amber-400 text-xs flex items-center gap-1">
                            <AlertTriangle size={12} /> Expire dans {daysLeft} jour(s)
                          </span>
                        ) : (
                          <span className="text-white/40 text-xs">{daysLeft} jours</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isExpired 
                            ? 'bg-white/5 text-white/40' 
                            : listing.isSold 
                              ? 'bg-white/5 text-white/40' 
                              : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {isExpired ? 'EXPIRÉE' : listing.isSold ? 'VENDU' : 'EN LIGNE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isExpired && isExpiringSoon && (
                            <button 
                              onClick={() => renewListing(listing.id)}
                              disabled={renewingId === listing.id}
                              className="text-amber-400 hover:text-amber-300 p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
                              title="Renouveler"
                            >
                              {renewingId === listing.id ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <RefreshCw size={16} />
                              )}
                            </button>
                          )}
                          <Link 
                            href={`/cars/${listing.id}`}
                            className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                            title="Voir"
                          >
                            <Eye size={16} />
                          </Link>
                          <button className="text-rose-500/50 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors" title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}