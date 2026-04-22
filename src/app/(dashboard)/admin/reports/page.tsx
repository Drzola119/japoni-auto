'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  AlertTriangle, 
  Trash2, 
  CheckCircle,
  Flag,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { Report } from '@/types';

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const q = query(collection(db!, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Report)));
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db!, 'reports', id), { status });
      toast.success('Statut du rapport mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce rapport ?')) {
      try {
        await deleteDoc(doc(db!, 'reports', id));
        toast.success('Rapport supprimé');
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-[#111111] p-8 rounded-2xl border border-[#2A2A2A] shadow-2xl">
        <h1 className="text-2xl font-serif text-white font-bold flex items-center gap-3">
          <AlertTriangle className="text-[#C9A84C]" />
          Signalements & Rapports
        </h1>
        <p className="text-[#555555] text-xs uppercase tracking-widest mt-2 font-bold">
          Modération du contenu et sécurité de la plateforme
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.length > 0 ? (
          reports.map((r, i) => (
            <motion.div 
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 hover:border-red-500/30 transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    r.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    <Flag size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Signalement: {r.reason || 'Raison non spécifiée'}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 text-[10px] text-[#A0A0A0] uppercase font-bold tracking-widest">
                        <User size={12} className="text-[#555555]" />
                        Par: {r.reporterName || 'Anonyme'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#A0A0A0] uppercase font-bold tracking-widest">
                        <Clock size={12} className="text-[#555555]" />
                        {r.createdAt ? formatDate(r.createdAt) : '--'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    r.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {r.status === 'resolved' ? 'Résolu' : 'Nouveau'}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#C9A84C] transition-all border border-[#2A2A2A] flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4">
                      <ExternalLink size={14} /> Voir l&apos;annonce
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(r.id, 'resolved')}
                      disabled={r.status === 'resolved'}
                      className="p-2.5 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-green-500 transition-all border border-[#2A2A2A] disabled:opacity-30"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(r.id)}
                      className="p-2.5 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-red-500 transition-all border border-[#2A2A2A]"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-20 text-center">
            <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2A2A2A] text-[#555555]">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-white font-serif text-xl font-light">Aucun signalement</h3>
            <p className="text-[#555555] text-sm mt-2 font-medium">La plateforme est saine et sécurisée.</p>
          </div>
        )}
      </div>
    </div>
  );
}
