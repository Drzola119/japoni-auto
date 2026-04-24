'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Car, Eye, MessageSquare, Plus, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/types';

function CheckCircle({ className, size }: { className?: string, size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function DailyLimitBanner({ user }: { user: User | null }) {
  const [timeLeft, setTimeLeft] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const usedToday = user?.lastPostDate === today ? (user.dailyPostCount ?? 0) : 0;
  const limit = user?.role === 'showroom' ? (user.showroomTier === 'gold' ? 999 : user.showroomTier === 'silver' ? 50 : 20) : 1;
  const limitReached = usedToday >= limit;

  useEffect(() => {
    if (!limitReached) return;
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const ms = midnight.getTime() - now.getTime();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [limitReached]);

  return (
    <div className={`rounded-xl border p-4 ${limitReached ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 bg-[#111116]'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white/70">Listings today</span>
        <span className="text-sm font-bold text-white">{usedToday}/{limit}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${limitReached ? 'bg-red-500' : 'bg-green-500'}`} 
          style={{ width: limitReached ? '100%' : `${(usedToday / limit) * 100}%` }} 
        />
      </div>
      {limitReached && (
        <p className="text-sm text-red-400 mt-2 flex items-center gap-2">
          <AlertTriangle size={14} />
          Limit reached — Next listing available in {timeLeft}
        </p>
      )}
    </div>
  );
}

function UpgradeBanner({ userRole, onShowTierModal }: { userRole: string, onShowTierModal: () => void }) {
  if (userRole === 'showroom') return null;
  
  return (
    <div className="rounded-xl border border-amber-200/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-amber-400">Upgrade to Showroom Plan</p>
        <p className="text-sm text-white/60">20 listings/day · 4 photos · Video link · Verified Badge</p>
        <p className="text-xs text-white/40 mt-1">Starting from 2,900 DA/month</p>
      </div>
      <button 
        onClick={onShowTierModal}
        className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap"
      >
        Learn More
      </button>
    </div>
  );
}

function TierComparisonModal({ isOpen, onClose, userRole }: { isOpen: boolean, onClose: () => void, userRole: string }) {
  if (!isOpen) return null;

  const tiers = [
    { name: 'Free Seller', price: '0 DA', color: 'text-white/50', features: ['1 listing/day', '1 photo', '30-day expiration'] },
    { name: 'Bronze', price: '2,900 DA/month', color: 'text-orange-400', features: ['20 listings/day', '4 photos', 'Video link', '60-day expiration', 'Verified badge', 'Public profile'] },
    { name: 'Silver', price: '5,900 DA/month', color: 'text-gray-300', features: ['50 listings/day', '4 photos', 'Video link', '60-day expiration', 'Verified badge', 'Public profile'] },
    { name: 'Gold', price: '9,900 DA/month', color: 'text-yellow-400', features: ['Unlimited', '4 photos', 'Video link', 'Never expires', 'Verified badge', 'Public profile'] },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">Plan Comparison</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiers.map((tier, i) => (
            <div key={i} className={`p-4 rounded-xl border ${i === 0 ? 'border-white/10 bg-white/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
              <h3 className={`font-bold ${tier.color}`}>{tier.name}</h3>
              <p className="text-lg font-bold text-white mt-1">{tier.price}</p>
              <ul className="mt-4 space-y-2">
                {tier.features.map((f, j) => (
                  <li key={j} className="text-xs text-white/60 flex items-center gap-2">
                    <CheckCircle size={12} className="text-green-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition">
          Close
        </button>
      </div>
    </div>
  );
}

export default function SellerOverview() {
  const { user } = useAuth();
  const [showTierModal, setShowTierModal] = useState(false);
  const role = user?.role || 'seller';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-cormorant text-white tracking-wide">
            {role === 'showroom' ? 'My Dashboard' : 'My Seller Account'}
          </h1>
          <p className="text-white/50 text-sm mt-1">Manage your vehicles, track performance, and respond to customers.</p>
        </div>
        <Link href="/seller-dashboard/listings/new" className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all">
          <Plus size={18} /> New Listing
        </Link>
      </div>

      {/* Daily Limit Banner */}
      <DailyLimitBanner user={user} />

      {/* Upgrade Banner (sellers only) */}
      <UpgradeBanner userRole={role} onShowTierModal={() => setShowTierModal(true)} />

      {/* Tier Comparison Modal */}
      <TierComparisonModal isOpen={showTierModal} onClose={() => setShowTierModal(false)} userRole={role} />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="text-white/50 text-sm font-medium uppercase tracking-wider text-[11px]">Active Listings</div>
            <Car className="text-[#C9A84C] opacity-50" size={20} />
          </div>
          <div className="text-3xl font-semibold text-white">{user?.totalListings || 0}</div>
        </div>
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="text-white/50 text-sm font-medium uppercase tracking-wider text-[11px]">Views (30d)</div>
            <Eye className="text-white/20" size={20} />
          </div>
          <div className="text-3xl font-semibold text-white">--</div>
        </div>
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="text-white/50 text-sm font-medium uppercase tracking-wider text-[11px]">Unread Messages</div>
            <MessageSquare className="text-amber-500 opacity-50" size={20} />
          </div>
          <div className="text-3xl font-semibold text-amber-500">--</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a24] to-[#111116] border border-[#C9A84C]/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <Star size={120} className="text-[#C9A84C] -mt-10 -mr-10" />
          </div>
          <div className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Account Status</div>
          <div className="text-white font-semibold flex items-center gap-2 relative z-10">
            {role === 'showroom' ? (
              <>
                Showroom {(user?.showroomTier || 'bronze').charAt(0).toUpperCase() + (user?.showroomTier || 'bronze').slice(1)}
                {user?.isVerified && <CheckCircle size={16} className="text-emerald-500" />}
              </>
            ) : (
              <>
                Verified Seller <CheckCircle size={16} className="text-emerald-500" />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-6">Recent Messages</h2>
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <p className="text-sm text-white/40 text-center">No messages yet</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-6">Top Performing Listings</h2>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-white/40 text-center">No listings yet</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}