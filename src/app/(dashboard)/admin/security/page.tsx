'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  Shield, 
  Activity, 
  Lock, 
  Key, 
  Terminal,
  AlertCircle
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { AuditLog } from '@/types';

export default function AdminSecurity() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db!, 'security_logs'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as AuditLog)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'login': return 'text-green-500';
      case 'failed_login': return 'text-red-500';
      case 'password_change': return 'text-[#C9A84C]';
      case 'role_change': return 'text-blue-500';
      default: return 'text-[#A0A0A0]';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-[#111111] p-8 rounded-2xl border border-[#2A2A2A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-[#E74C3C]/5 blur-[80px] rounded-full" />
        <div className="relative z-10">
          <h1 className="text-2xl font-serif text-white font-bold flex items-center gap-3">
            <Shield className="text-[#C9A84C]" />
            Sécurité & Journaux d&apos;Accès
          </h1>
          <p className="text-[#555555] text-xs uppercase tracking-widest mt-2 font-bold">Surveillance en temps réel des accès administratifs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Logs Table */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1E1E1E] bg-[#161616] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C9A84C]">
                <Terminal size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Logs Console</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                </span>
              </div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#111111] z-10">
                  <tr className="text-[9px] uppercase tracking-widest text-[#555555] font-bold border-b border-[#1E1E1E]">
                    <th className="px-6 py-4">Événement</th>
                    <th className="px-6 py-4">IP / Appareil</th>
                    <th className="px-6 py-4">Utilisateur</th>
                    <th className="px-6 py-4 text-right">Date & Heure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1E1E]">
                  {logs.length > 0 ? logs.map((log, i) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#1A1A1A] transition-all group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Activity size={14} className={getLogColor(log.type)} />
                          <span className="text-xs text-[#F5F0E8] font-medium">{log.message}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-[#4A4840] font-mono bg-[#0A0A0A] px-2 py-1 rounded border border-[#1E1E1E]">
                          {log.ip || '192.168.1.1'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-[#A0A0A0]">{log.userEmail || 'admin@japoni.auto'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] text-[#555555] font-bold uppercase">{log.createdAt ? formatDate(log.createdAt) : 'Aujourd\'hui'}</span>
                      </td>
                    </motion.tr>
                  )) : (
                    // Dummy data for visual check
                    [...Array(10)].map((_, i) => (
                      <tr key={i} className="border-b border-[#1E1E1E] opacity-40">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <Activity size={14} className="text-green-500" />
                          <span className="text-xs text-[#F5F0E8] font-medium">Connexion réussie: Admin</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-[#4A4840] font-mono bg-[#0A0A0A] px-2 py-1 rounded">197.200.{i}.{i+10}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#A0A0A0]">admin@japoni.auto</td>
                        <td className="px-6 py-4 text-right text-[10px] text-[#555555] font-bold uppercase tracking-tighter">Il y a {i+1} min</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-serif text-lg font-bold mb-6 flex items-center gap-2">
              <Lock size={18} className="text-[#C9A84C]" /> Etat du Système
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#555555] font-bold uppercase tracking-widest">Force Firewall</span>
                  <span className="text-xs text-green-500 font-bold">98%</span>
                </div>
                <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[98%]" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-2xl border border-red-500/20">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-500" />
                  <div>
                    <p className="text-xs text-white font-bold">Tentatives échouées</p>
                    <p className="text-[10px] text-[#555555]">Dernières 24h</p>
                  </div>
                </div>
                <span className="text-lg font-black text-red-500 font-inter">0</span>
              </div>

              <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A]">
                <div className="flex items-center gap-3 mb-4">
                  <Key size={20} className="text-[#C9A84C]" />
                  <p className="text-xs text-white font-bold">Sessions Actives</p>
                </div>
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-[#C9A84C] border-2 border-[#111111] flex items-center justify-center text-[10px] font-bold text-[#07070C]">
                      A
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#111111] flex items-center justify-center text-[10px] font-bold text-[#A0A0A0]">
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
