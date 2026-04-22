'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface Props {
  onMenuClick: () => void;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function AdminTopbar({ onMenuClick }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Get dynamic title based on path
  const getTitle = () => {
    const parts = pathname.split('/');
    const last = parts[parts.length - 1];
    switch (last) {
      case 'admin': return 'Tableau de Bord';
      case 'listings': return 'Gestion des Annonces';
      case 'users': return 'Utilisateurs';
      case 'sellers': return 'Vendeurs';
      case 'reports': return 'Rapports';
      case 'security': return 'Sécurité & Logs';
      case 'settings': return 'Paramètres';
      default: return 'Administration';
    }
  };

  useEffect(() => {
    const q = query(collection(db!, 'notifications'), orderBy('createdAt', 'desc'), limit(5));
    return onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as AdminNotification)));
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-[#1E1E1E] sticky top-0 z-40 w-full px-6 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#A0A0A0] hover:text-[#C9A84C] transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-white font-serif font-semibold text-lg tracking-wide hidden sm:block">
          {getTitle()}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" size={16} />
          <input 
            type="text"
            placeholder="Rechercher..."
            className="w-64 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/20 transition-all placeholder:text-[#555555]"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-2.5 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#C9A84C] transition-all relative group"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#C9A84C] rounded-full shadow-[0_0_8px_#C9A84C]" />
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-[#1E1E1E] flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">Notifications</h3>
                  {unreadCount > 0 && <span className="text-[10px] text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-full">{unreadCount} nouvelles</span>}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition-colors cursor-pointer group">
                        <p className="text-[#F5F0E8] text-sm font-medium group-hover:text-[#C9A84C] transition-colors">{n.title}</p>
                        <p className="text-[#A0A0A0] text-xs mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-[#555555] text-[10px] mt-2 italic">Il y a un instant</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-[#555555] text-sm italic">
                      Aucune notification
                    </div>
                  )}
                </div>
                <button className="w-full p-3 text-center text-[#C9A84C] text-xs font-bold hover:bg-[#1A1A1A] transition-colors">
                  Voir tout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A84C]/30 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#C9A84C] flex items-center justify-center text-[#07070C] font-bold ring-2 ring-[#C9A84C]/20 shadow-[0_0_10px_rgba(201,168,76,0.1)]">
              {user?.displayName?.charAt(0) || 'A'}
            </div>
            <ChevronDown size={14} className={`text-[#555555] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-[#1E1E1E] bg-[#161616]">
                  <p className="text-white text-sm font-bold truncate">{user?.displayName}</p>
                  <p className="text-[#555555] text-xs truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white transition-all group">
                    <User size={16} className="text-[#555555] group-hover:text-[#C9A84C]" />
                    Mon Profil
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white transition-all group">
                    <Settings size={16} className="text-[#555555] group-hover:text-[#C9A84C]" />
                    Paramètres
                  </button>
                  <div className="my-2 border-t border-[#1E1E1E]" />
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#E74C3C] hover:bg-red-500/10 transition-all group"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
