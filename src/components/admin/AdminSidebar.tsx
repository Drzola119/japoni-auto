'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m as motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  BadgeCheck, 
  BarChart2,
  BarChart3, 
  Activity, 
  Settings, 
  LogOut,
  X,
  Shield,
  LucideIcon,
  Inbox,
  Megaphone,
  Search
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  collection, query, where, onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Building2 } from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
  onClick?: () => void;
}

function SidebarItem({ href, icon: Icon, label, active, badge, onClick }: SidebarItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400 }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl mx-2 text-sm transition-all duration-200 cursor-pointer group",
          active 
            ? "bg-gradient-to-r from-[#C9A84C]/20 to-transparent border-l-2 border-[#C9A84C] text-[#C9A84C] font-medium" 
            : "text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white"
        )}
      >
        <Icon size={18} className={cn(active ? "text-[#C9A84C]" : "text-[#555555] group-hover:text-white")} />
        <span className="flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="bg-[#F39C12]/20 text-[#F39C12] text-xs px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0)
  const [showroomAppCount, setShowroomAppCount] = useState(0)

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'listings'), where('status', '==', 'pending'))
    const unsub = onSnapshot(q, (snap) => setPendingCount(snap.size))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'showroomApplications'), where('status', '==', 'pending'))
    const unsub = onSnapshot(q, (snap) => setShowroomAppCount(snap.size))
    return () => unsub()
  }, [])

  const sections = [
    {
      title: "PRINCIPAL",
      items: [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/listings", icon: Car, label: "Listings" },
        { href: "/admin/queue", icon: Inbox, label: "Queue", badge: pendingCount },
        { href: "/admin/showroom-applications", icon: Building2, label: "Showroom Applications", badge: showroomAppCount },
        { href: "/admin/users", icon: Users, label: "Users" },
        { href: "/admin/sellers", icon: BadgeCheck, label: "Sellers" },
      ]
    },
    {
      title: "ANALYSE",
      items: [
        { href: "/admin/analytics", icon: BarChart2, label: "Analytics" },
        { href: "/admin/search-analytics", icon: Search, label: "Searches" },
        { href: "/admin/tracking", icon: Activity, label: "Tracking & Security" },
        { href: "/admin/reports", icon: BarChart3, label: "Reports" },
        { href: "/admin/security", icon: Shield, label: "Security & Audit" },
      ]
    },
    {
      title: "SYSTÈME",
      items: [
        { href: "/admin/settings", icon: Settings, label: "Settings" },
        { href: "/admin/broadcast", icon: Megaphone, label: "Broadcast" },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0D0D0D] border-r border-[#1E1E1E]">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#C9A84C] flex items-center justify-center text-[#07070C] font-bold shadow-[0_0_15px_rgba(201,168,76,0.3)]">
            JA
          </div>
          <span className="text-white font-serif text-xl tracking-[0.15em] font-light">
            JAPONI <span className="text-[#C9A84C] font-bold">AUTO</span>
          </span>
        </Link>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mt-6 opacity-30" />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-6 text-[10px] uppercase tracking-[0.2em] text-[#555555] mb-2 font-bold">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem 
                  key={item.href} 
                  {...item} 
                  active={pathname === item.href}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#1E1E1E] bg-[#0A0A0A]/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#111111] border border-[#2A2A2A]">
          <div className="w-10 h-10 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#07070C] font-bold border-2 border-[#0D0D0D] shadow-[0_0_10px_rgba(201,168,76,0.2)]">
            {user?.displayName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{user?.displayName || 'Admin'}</p>
            <div className="flex items-center gap-1">
              <Shield size={10} className="text-[#C9A84C]" />
              <span className="text-[10px] text-[#C9A84C] uppercase font-bold tracking-wider">Admin</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-sm text-[#E74C3C] hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-50">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-[70] lg:hidden"
            >
              <div className="absolute right-4 top-4 z-[80] lg:hidden">
                <button onClick={onClose} className="p-2 text-white/50 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}