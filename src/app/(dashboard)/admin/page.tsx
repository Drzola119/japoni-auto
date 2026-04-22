'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { m as motion } from 'framer-motion';
import { 
  Car, 
  Users, 
  BadgeCheck, 
  Clock, 
  Calendar,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import StatsCard from '@/components/admin/StatsCard';
import RecentListingsTable from '@/components/admin/RecentListingsTable';
import ActivityFeed from '@/components/admin/ActivityFeed';
import UsersTable from '@/components/admin/UsersTable';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    totalUsers: 0,
    activeSellers: 0,
    pendingListings: 0
  });

  useEffect(() => {
    // Total Listings
    const unsubListings = onSnapshot(collection(db!, 'listings'), (snap) => {
      setStats(prev => ({ ...prev, totalListings: snap.size }));
    });

    // Total Users
    const unsubUsers = onSnapshot(collection(db!, 'users'), (snap) => {
      setStats(prev => ({ ...prev, totalUsers: snap.size }));
    });

    // Active Sellers
    const qSellers = query(collection(db!, 'users'), where('role', '==', 'seller'));
    const unsubSellers = onSnapshot(qSellers, (snap) => {
      setStats(prev => ({ ...prev, activeSellers: snap.size }));
    });

    // Pending Listings
    const qPending = query(collection(db!, 'listings'), where('status', '==', 'pending'));
    const unsubPending = onSnapshot(qPending, (snap) => {
      setStats(prev => ({ ...prev, pendingListings: snap.size }));
    });

    return () => {
      unsubListings();
      unsubUsers();
      unsubSellers();
      unsubPending();
    };
  }, []);

  const today = new Intl.DateTimeFormat('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-[#111111] border border-[#2A2A2A] p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/5 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A84C]/5 blur-[80px] rounded-full -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-serif text-white font-light">
              Bonjour, <span className="font-bold text-[#C9A84C]">{user?.displayName || 'Admin'}</span> 👋
            </h2>
            <p className="text-[#A0A0A0] mt-2 font-medium">
              Voici ce qui se passe sur <span className="text-white">Japoni Auto</span> aujourd&apos;hui.
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl">
            <Calendar size={18} className="text-[#C9A84C]" />
            <span className="text-sm font-bold text-[#F5F0E8] capitalize">{today}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard 
          icon={Car} 
          value={stats.totalListings} 
          label="Annonces Totales" 
          trend={{ value: "+12% ce mois", isPositive: true }}
          delay={0.1}
        />
        <StatsCard 
          icon={Users} 
          value={stats.totalUsers} 
          label="Utilisateurs Inscrits" 
          trend={{ value: "+8% ce mois", isPositive: true }}
          delay={0.2}
        />
        <StatsCard 
          icon={BadgeCheck} 
          value={stats.activeSellers} 
          label="Vendeurs Actifs" 
          delay={0.3}
        />
        <StatsCard 
          icon={Clock} 
          value={stats.pendingListings} 
          label="En Attente" 
          delay={0.4}
        />
      </div>

      {/* Pending Alert Banner */}
      {stats.pendingListings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F39C12]/10 border border-[#F39C12]/30 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-[#F39C12]" />
            <div>
              <p className="text-white font-medium">
                ⚡ {stats.pendingListings} annonce{stats.pendingListings !== 1 ? 's' : ''} attendent votre approbation
              </p>
              <p className="text-xs text-[#A0A0A0]">Traitez-les rapidement dans la file d&apos;attente</p>
            </div>
          </div>
          <Link
            href="/admin/queue"
            className="flex items-center gap-2 px-4 py-2 bg-[#F39C12] text-black font-medium rounded-xl hover:bg-[#E8C96A] transition-all"
          >
            Traiter maintenant
            <ChevronRight size={16} />
          </Link>
        </motion.div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Listings */}
        <div className="lg:col-span-2">
          <RecentListingsTable />
        </div>

        {/* Right: Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Bottom Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wilayas Chart Placeholder (Custom CSS Bars) */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white font-serif text-lg font-semibold border-l-2 border-[#C9A84C] pl-3">
              Annonces par Wilaya
            </h3>
            <button className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity">
              Détails <ChevronRight size={12} />
            </button>
          </div>
          
          <div className="space-y-5">
            {[
              { name: 'Alger', count: 1420, percent: 85 },
              { name: 'Oran', count: 850, percent: 65 },
              { name: 'Blida', count: 620, percent: 45 },
              { name: 'Sétif', count: 430, percent: 35 },
              { name: 'Constantine', count: 390, percent: 30 },
              { name: 'Annaba', count: 210, percent: 15 },
            ].map((w, i) => (
              <div key={w.name}>
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-[#A0A0A0] uppercase tracking-wider">{w.name}</span>
                  <span className="text-white">{w.count}</span>
                </div>
                <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden border border-[#2A2A2A]">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${w.percent}%` }}
                    transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#A07830] to-[#C9A84C]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Users */}
        <UsersTable />
      </div>
    </div>
  );
}
