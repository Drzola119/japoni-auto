'use client';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

import { Settings, LogOut, FileText, Lock, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      toast.error('Error logging out');
    }
  };

  if (!user) {
    return <div className="min-h-screen pt-32 pb-16 px-4 bg-[#07070A] text-white text-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-8 bg-[#07070A] text-white">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <div>
          <h1 className="text-3xl font-bold font-cormorant tracking-wide text-white">My Account</h1>
          <p className="text-white/50 text-sm mt-1">Manage your personal information and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar Menu */}
          <div className="md:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'general' ? 'bg-white/5 border border-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Settings size={18} className={activeTab === 'general' ? 'text-[#C9A84C]' : ''} />
              General Profile
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'security' ? 'bg-white/5 border border-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Lock size={18} className={activeTab === 'security' ? 'text-[#C9A84C]' : ''} />
              Security & Password
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'data' ? 'bg-white/5 border border-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <FileText size={18} className={activeTab === 'data' ? 'text-[#C9A84C]' : ''} />
              My Data (GDPR)
            </button>
            {(user.role === 'admin' || user.email === 'zickowiko@gmail.com') && (
              <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] font-bold text-sm transition-colors mt-4">
                <Shield size={18} />
                Dashboard Admin
              </Link>
            )}
            <div className="pt-4 mt-4 border-t border-white/5">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-500 font-medium text-sm transition-colors">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Full Name</label>
                  <input type="text" defaultValue={user.displayName || ''} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Email Address</label>
                  <input type="email" defaultValue={user.email || ''} disabled className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 cursor-not-allowed" />
                  <p className="text-[10px] text-white/30 mt-2">The email address cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Phone Number</label>
                  <input type="tel" placeholder="Add a phone number" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="button" className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-6 py-3 rounded-xl text-sm font-bold hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all">
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
