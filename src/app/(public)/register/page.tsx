'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { m as motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { doc, updateDoc } from 'firebase/firestore';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<'user' | 'seller'>('user');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      
      // The context sets role to 'user' by default. Update if they registered as seller.
      if (accountType === 'seller') {
        const { auth, db } = await import('@/lib/firebase');
        if (auth?.currentUser && db) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), { role: 'seller' });
        }
      }
      
      toast.success('Compte créé avec succès !');
      router.push('/account'); // Auth redirection logic handles role
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Connecté avec Google !');
      router.push('/account');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erreur Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-white bg-[#07070A]">
      {/* Left side Image - Hidden on mobile */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80')" }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent to-[#07070A]" />
        
        <div className="relative z-20 p-16 max-w-lg">
          <Link href="/" className="inline-block mb-12 group">
            <h1 className="text-4xl font-bold tracking-widest text-[#E8C96A] mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
              JAPONI <span className="opacity-70">AUTO</span>
            </h1>
            <div className="w-12 h-1 bg-[#C9A84C] transition-all group-hover:w-full duration-500" />
          </Link>
          <h2 className="text-4xl font-semibold mb-6 leading-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Rejoignez l&apos;élite.
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Créez votre profil en quelques secondes et plongez dans la collection de véhicules premium la plus prisée d&apos;Algérie.
          </p>
          
          <div className="mt-12 space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] bg-[#111116]/80 backdrop-blur shrink-0">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm text-white/70">Plateforme 100% sécurisée et vendeurs rigoureusement vérifiés par nos soins.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] bg-[#111116]/80 backdrop-blur shrink-0">
                <BadgeCheck size={20} />
              </div>
              <p className="text-sm text-white/70">Vendez votre véhicule plus rapidement à une audience qualifiée et sérieuse.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold tracking-widest text-[#E8C96A]" style={{ fontFamily: 'var(--font-cormorant)' }}>
                JAPONI <span className="opacity-70">AUTO</span>
              </h1>
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-2xl font-semibold mb-2">Créer un compte</h3>
            <p className="text-white/50">L&apos;inscription prend moins de 30 secondes</p>
          </div>
          
          {/* Account Type Selector */}
          <div className="flex p-1 bg-[#111116] rounded-xl mb-8 border border-white/5">
            <button 
              onClick={() => setAccountType('user')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                accountType === 'user' 
                ? 'bg-[#2A2A35] text-white shadow-sm' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Je veux acheter
            </button>
            <button 
              onClick={() => setAccountType('seller')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                accountType === 'seller' 
                ? 'bg-[#C9A84C] text-[#111] shadow-sm' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Je suis vendeur
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {accountType === 'seller' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 mb-6"
                >
                  <p className="text-xs text-[#C9A84C]/90">
                    En créant un compte vendeur, vous aurez accès à un tableau de bord privé pour gérer vos annonces et recevoir les demandes directement.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-white/60 text-sm font-medium mb-2 block uppercase tracking-wider text-[11px]">Nom / Entreprise</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#C9A84C] transition-colors" />
                <input 
                  value={form.name} 
                  onChange={handleChange('name')} 
                  type="text" 
                  placeholder={accountType === 'seller' ? "Nom de votre showroom" : "Votre nom complet"} 
                  className="w-full bg-[#111116] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-[#C9A84C] disabled:opacity-50 transition-all" 
                  style={{ fontSize: '16px' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-2 block uppercase tracking-wider text-[11px]">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#C9A84C] transition-colors" />
                <input 
                  value={form.email} 
                  onChange={handleChange('email')} 
                  type="email" 
                  placeholder="votre@email.com" 
                  className="w-full bg-[#111116] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-[#C9A84C] disabled:opacity-50 transition-all" 
                  style={{ fontSize: '16px' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-2 block uppercase tracking-wider text-[11px]">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#C9A84C] transition-colors" />
                <input
                  value={form.password}
                  onChange={handleChange('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-[#111116] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white focus:outline-none focus:border-[#C9A84C] disabled:opacity-50 transition-all"
                  style={{ fontSize: '16px' }}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-4 bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)]"
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="flex items-center gap-4 mt-8 mb-8">
            <hr className="flex-1 border-white/10" />
            <span className="text-white/30 text-xs uppercase tracking-widest">Ou plus simple</span>
            <hr className="flex-1 border-white/10" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-[#111116] border border-white/10 rounded-xl py-4 flex items-center justify-center gap-3 hover:bg-white/5 disabled:opacity-50 transition-all font-medium text-white/90"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Continuer avec Google
          </button>

          <p className="text-center text-white/50 text-sm mt-10">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-[#C9A84C] hover:text-[#E8C96A] font-medium transition-colors">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
