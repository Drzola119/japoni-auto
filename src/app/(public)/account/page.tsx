'use client';

export const dynamic = 'force-dynamic';

import { Settings, LogOut, FileText, Lock, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (!user) {
    return <div className="min-h-screen pt-32 pb-16 px-4 bg-[#07070A] text-white text-center">Redirection...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-8 bg-[#07070A] text-white">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <div>
          <h1 className="text-3xl font-bold font-cormorant tracking-wide text-white">Mon Compte</h1>
          <p className="text-white/50 text-sm mt-1">Gérez vos informations personnelles et vos préférences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar Menu */}
          <div className="md:col-span-1 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm transition-colors">
              <Settings size={18} className="text-[#C9A84C]" />
              Profil Général
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white font-medium text-sm transition-colors">
              <Lock size={18} />
              Sécurité & Mot de passe
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white font-medium text-sm transition-colors">
              <FileText size={18} />
              Mes Données (RGPD)
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
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Informations Personnelles</h2>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Nom Complet</label>
                  <input type="text" defaultValue={user.displayName || ''} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Adresse Email</label>
                  <input type="email" defaultValue={user.email || ''} disabled className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 cursor-not-allowed" />
                  <p className="text-[10px] text-white/30 mt-2">L&apos;adresse email ne peut pas être modifiée.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Numéro de Téléphone</label>
                  <input type="tel" placeholder="Ajouter un numéro" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="button" className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-6 py-3 rounded-xl text-sm font-bold hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all">
                    Enregistrer les modifications
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
