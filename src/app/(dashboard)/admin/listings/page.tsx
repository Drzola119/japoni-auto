'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { CarListing } from '@/types';

export default function AdminListings() {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const q = query(collection(db!, 'listings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as CarListing)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db!, 'listings', id), { status });
      toast.success(`Statut mis à jour: ${status}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await deleteDoc(doc(db!, 'listings', id));
        toast.success('Annonce supprimée');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.sellerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedListings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedListings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedListings.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-[#2A2A2A]">
        <div>
          <h1 className="text-2xl font-serif text-white font-bold">Gestion des Annonces</h1>
          <p className="text-[#555555] text-xs uppercase tracking-widest mt-1 font-bold">Total: {filteredListings.length} annonces</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#07070C] rounded-xl font-bold text-sm hover:bg-[#E8C96A] transition-all shadow-[0_4px_20px_rgba(201,168,76,0.2)]">
          <Download size={18} />
          Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" size={18} />
          <input 
            type="text"
            placeholder="Rechercher par titre ou vendeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#C9A84C]/50 outline-none"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/50 appearance-none cursor-pointer"
        >
          <option value="all">Tous les Statuts</option>
          <option value="pending">En Attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Rejetées</option>
        </select>
        <button className="flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-[#A0A0A0] text-sm font-medium hover:text-white transition-all">
          <Filter size={18} />
          Plus de filtres
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] text-[10px] uppercase tracking-[0.2em] text-[#555555] font-bold border-b border-[#1E1E1E]">
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === paginatedListings.length && paginatedListings.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-[#C9A84C]" 
                  />
                </th>
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4">Véhicule</th>
                <th className="px-6 py-4">Vendeur</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {paginatedListings.map((l, i) => (
                <motion.tr 
                  key={l.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#1A1A1A] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(l.id)}
                      onChange={() => toggleSelect(l.id)}
                      className="w-4 h-4 rounded accent-[#C9A84C]" 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-14 h-10 rounded-lg overflow-hidden relative border border-[#2A2A2A] group-hover:border-[#C9A84C]/40 transition-colors">
                      <Image 
                        src={l.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100&q=40'} 
                        alt={l.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white font-bold">{l.title}</p>
                    <p className="text-[10px] text-[#555555] uppercase tracking-tighter">{l.brand} • {l.year} • {l.wilaya}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#A0A0A0]">{l.sellerName}</td>
                  <td className="px-6 py-4 text-sm text-[#C9A84C] font-bold">{formatPrice(l.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${
                      l.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      l.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {l.status === 'approved' ? 'Approuvé' : l.status === 'rejected' ? 'Rejeté' : 'Attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#555555]">{l.createdAt ? formatDate(l.createdAt) : '--'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="p-2 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#C9A84C] transition-all hover:bg-[#252525]">
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(l.id, 'approved')}
                        className="p-2 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-green-500 transition-all hover:bg-[#252525]"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(l.id, 'rejected')}
                        className="p-2 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-red-500 transition-all hover:bg-[#252525]"
                      >
                        <XCircle size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(l.id)}
                        className="p-2 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-red-600 transition-all hover:bg-[#252525]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-[#1E1E1E] flex items-center justify-between">
          <p className="text-xs text-[#555555] font-bold uppercase tracking-widest">Page {currentPage} sur {totalPages}</p>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#C9A84C] disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#C9A84C] disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#C9A84C] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 z-50"
            >
              <span className="text-[#07070C] font-bold text-sm">{selectedIds.length} sélectionnés</span>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-[#07070C] text-white text-xs font-bold rounded-xl hover:bg-[#222] transition-all">Approuver</button>
                <button className="px-4 py-2 bg-[#07070C] text-white text-xs font-bold rounded-xl hover:bg-[#222] transition-all">Rejeter</button>
                <button className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all">Supprimer</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
