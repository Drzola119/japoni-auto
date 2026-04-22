'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Shield, User, BadgeCheck } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { User as UserType } from '@/types';

export default function UsersTable() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db!, 'users'), orderBy('createdAt', 'desc'), limit(6));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as unknown as UserType)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <span className="flex items-center gap-1 text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest"><Shield size={10} /> Admin</span>;
      case 'seller': return <span className="flex items-center gap-1 text-blue-500 text-[10px] font-bold uppercase tracking-widest"><BadgeCheck size={10} /> Vendeur</span>;
      default: return <span className="flex items-center gap-1 text-[#555555] text-[10px] font-bold uppercase tracking-widest"><User size={10} /> Client</span>;
    }
  };

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-[#1E1E1E]">
        <h3 className="text-white font-serif text-lg font-semibold border-l-2 border-[#C9A84C] pl-3">
          Nouveaux Utilisateurs
        </h3>
      </div>

      <div className="p-2">
        {users.map((user, i) => (
          <motion.div 
            key={user.uid}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-3 hover:bg-[#1A1A1A] rounded-xl transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#C9A84C] flex items-center justify-center text-[#07070C] font-bold ring-2 ring-[#C9A84C]/10 border border-[#2A2A2A] group-hover:scale-105 transition-transform">
              {user.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#F5F0E8] font-bold truncate">{user.displayName}</p>
              <p className="text-[10px] text-[#555555] truncate">{user.email}</p>
            </div>
            <div className="text-right">
              {getRoleBadge(user.role || 'user')}
              <p className="text-[9px] text-[#4A4840] mt-1 font-medium">{user.createdAt ? formatDate(user.createdAt) : 'Aujourd\'hui'}</p>
            </div>
          </motion.div>
        ))}
        
        {users.length === 0 && !loading && (
          <div className="py-10 text-center text-[#555555] text-xs italic">
            Aucun utilisateur
          </div>
        )}
      </div>
      
      <button className="w-full p-3 text-center text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#1A1A1A] transition-colors border-t border-[#1E1E1E]">
        Gérer tous les utilisateurs
      </button>
    </div>
  );
}
