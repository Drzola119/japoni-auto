'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Shield, 
  BadgeCheck, 
  Ban, 
  Search, 
  Mail,
  Phone,
  MapPin,
  Edit2,
  Eye,
  MoreVertical,
  X,
  User,
  Calendar,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { User as UserType } from '@/types';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewUser, setViewUser] = useState<UserType | null>(null);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    const q = query(collection(db!, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as unknown as UserType)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await updateDoc(doc(db!, 'users', id), { role });
      toast.success(`Rôle mis à jour: ${role}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleToggleStatus = async (id: string, suspended: boolean) => {
    try {
      await updateDoc(doc(db!, 'users', id), { suspended: !suspended });
      toast.success(suspended ? 'Compte réactivé' : 'Compte suspendu');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      await updateDoc(doc(db!, 'users', editUser.uid), { 
        role: editRole,
        suspended: editStatus === 'suspended'
      });
      toast.success('Utilisateur mis à jour');
      setEditUser(null);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleOpenEdit = (user: UserType) => {
    setEditUser(user);
    setEditRole(user.role || 'user');
    setEditStatus(user.suspended ? 'suspended' : 'active');
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <span className="px-2 py-1 bg-[#C9A84C]/10 text-[#C9A84C] text-[9px] font-bold uppercase rounded-full border border-[#C9A84C]/20">Administrateur</span>;
      case 'seller': return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase rounded-full border border-blue-500/20">Vendeur</span>;
      default: return <span className="px-2 py-1 bg-[#2A2A2A] text-[#A0A0A0] text-[9px] font-bold uppercase rounded-full">Acheteur</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#111111] p-8 rounded-2xl border border-[#2A2A2A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-[#C9A84C]/5 blur-[60px] rounded-full" />
        <div className="relative z-10">
          <h1 className="text-2xl font-serif text-white font-bold">Gestion des Utilisateurs</h1>
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#C9A84C]">{users.length}</span>
              <span className="text-[10px] text-[#555555] uppercase font-bold tracking-widest">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-500">{users.filter(u => u.role === 'seller').length}</span>
              <span className="text-[10px] text-[#555555] uppercase font-bold tracking-widest">Vendeurs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-500">{users.filter(u => u.suspended).length}</span>
              <span className="text-[10px] text-[#555555] uppercase font-bold tracking-widest">Suspendus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" size={18} />
          <input 
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#C9A84C]/50 outline-none transition-all"
          />
        </div>
        <div className="flex bg-[#111111] p-1 rounded-xl border border-[#2A2A2A]">
          {['all', 'admin', 'seller', 'user'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                roleFilter === r ? 'bg-[#C9A84C] text-[#07070C]' : 'text-[#555555] hover:text-[#A0A0A0]'
              }`}
            >
              {r === 'all' ? 'Tous' : r === 'admin' ? 'Admin' : r === 'seller' ? 'Vendeur' : 'Client'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((u, i) => (
          <motion.div 
            key={u.uid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#C9A84C]/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#C9A84C] flex items-center justify-center text-[#07070C] text-xl font-bold border border-[#2A2A2A] shadow-[0_4px_15px_rgba(201,168,76,0.2)] group-hover:scale-105 transition-transform">
                  {u.displayName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold">{u.displayName}</h3>
                    {u.suspended && <span className="p-1 bg-red-500/20 text-red-500 rounded-lg"><Ban size={10} /></span>}
                  </div>
                  <div className="mt-1">{getRoleBadge(u.role || 'user')}</div>
                </div>
              </div>
              <button className="p-2 text-[#555555] hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
                <Mail size={14} className="text-[#555555]" />
                <span className="truncate">{u.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
                <Phone size={14} className="text-[#555555]" />
                <span>{u.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
                <MapPin size={14} className="text-[#555555]" />
                <span>{u.wilaya || 'Non renseigné'}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#1E1E1E] flex items-center justify-between">
              <p className="text-[10px] text-[#555555] font-bold uppercase tracking-widest">Inscrit le {(u.createdAt as any) ? formatDate(u.createdAt) : '--'}</p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleStatus(u.uid, u.suspended || false)}
                  className={`p-2 rounded-xl transition-all ${u.suspended ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                  title={u.suspended ? 'Réactiver' : 'Suspendre'}
                >
                  <Ban size={16} />
                </button>
                <button 
                  onClick={() => handleOpenEdit(u)}
                  className="p-2 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#C9A84C] transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => setViewUser(u)}
                  className="p-2 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-white transition-all"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View User Modal */}
      <AnimatePresence>
        {viewUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Détails de l'utilisateur</h2>
                <button onClick={() => setViewUser(null)} className="p-2 text-[#555555] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-[#0A0A0A] rounded-xl">
                  <div className="w-16 h-16 rounded-2xl bg-[#C9A84C] flex items-center justify-center text-[#07070C] text-2xl font-bold">
                    {viewUser.displayName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{viewUser.displayName}</h3>
                    <div className="mt-1">{getRoleBadge(viewUser.role || 'user')}</div>
                    {viewUser.suspended && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 text-[9px] font-bold uppercase rounded-full border border-red-500/20 mt-1">
                        <AlertTriangle size={10} /> Suspendu
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0A0A0A] rounded-xl">
                    <div className="flex items-center gap-2 text-[#555555] text-xs mb-1">
                      <Mail size={14} /> Email
                    </div>
                    <p className="text-white text-sm">{viewUser.email}</p>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] rounded-xl">
                    <div className="flex items-center gap-2 text-[#555555] text-xs mb-1">
                      <Phone size={14} /> Téléphone
                    </div>
                    <p className="text-white text-sm">{viewUser.phone || 'Non renseigné'}</p>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] rounded-xl">
                    <div className="flex items-center gap-2 text-[#555555] text-xs mb-1">
                      <MapPin size={14} /> Wilaya
                    </div>
                    <p className="text-white text-sm">{viewUser.wilaya || 'Non renseignée'}</p>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] rounded-xl">
                    <div className="flex items-center gap-2 text-[#555555] text-xs mb-1">
                      <Calendar size={14} /> Inscrit le
                    </div>
                    <p className="text-white text-sm">{(viewUser.createdAt as any) ? formatDate(viewUser.createdAt) : '--'}</p>
                  </div>
                </div>

                {viewUser.role === 'seller' && (
                  <div className="p-4 bg-[#0A0A0A] rounded-xl">
                    <div className="flex items-center gap-2 text-[#555555] text-xs mb-2">
                      <Activity size={14} /> Activité
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-[#555555] uppercase">Annonces</p>
                        <p className="text-white font-bold">{viewUser.dailyPostCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#555555] uppercase">Dernière publication</p>
                        <p className="text-white text-sm">{viewUser.lastPostDate ? formatDate(viewUser.lastPostDate) : '--'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-[#1E1E1E] flex justify-end">
                <button
                  onClick={() => setViewUser(null)}
                  className="px-6 py-2 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-[#2A2A2A] transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Modifier l'utilisateur</h2>
                <button onClick={() => setEditUser(null)} className="p-2 text-[#555555] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-[#0A0A0A] rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A84C] flex items-center justify-center text-[#07070C] text-xl font-bold">
                    {editUser.displayName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{editUser.displayName}</h3>
                    <p className="text-[#555555] text-xs">{editUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#555555] font-bold uppercase tracking-widest mb-2">Rôle</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:border-[#C9A84C]/50 outline-none transition-colors"
                  >
                    <option value="user">Client</option>
                    <option value="seller">Vendeur</option>
                    <option value="showroom">Showroom</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#555555] font-bold uppercase tracking-widest mb-2">Statut</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:border-[#C9A84C]/50 outline-none transition-colors"
                  >
                    <option value="active">Actif</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#1E1E1E] flex gap-3 justify-end">
                <button
                  onClick={() => setEditUser(null)}
                  className="px-6 py-2 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-[#2A2A2A] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-[#C9A84C] text-[#07070C] rounded-xl text-sm font-bold hover:bg-[#D4B55D] transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
