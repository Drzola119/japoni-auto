'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { m as motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, BadgeCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

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
      const role = accountType === 'seller' ? 'seller' : 'buyer';
      await register(form.email, form.password, form.name, role);
      toast.success('Account created successfully!');
      router.push('/account');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      router.push('/account');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Google error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-white bg-[#07070A]">
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
            Join the elite.
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Create your profile in seconds and dive into Algeria&apos;s most sought-after premium vehicle collection.
          </p>
          
          <div className="mt-12 space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] bg-[#111116]/80 backdrop-blur shrink-0">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm text-white/70">100% secure platform and rigorously verified sellers.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] bg-[#111116]/80 backdrop-blur shrink-0">
                <BadgeCheck size={20} />
              </div>
              <p className="text-sm text-white/70">Sell your vehicle faster to a qualified and serious audience.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-10"
        >
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold tracking-widest text-[#E8C96A]" style={{ fontFamily: 'var(--font-cormorant)' }}>
                JAPONI <span className="opacity-70">AUTO</span>
              </h1>
            </Link>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Create Account
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Join the elite — registration takes less than 30 seconds
          </p>

          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('user')}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                accountType === 'user' 
                  ? 'bg-[#C9A84C] text-[#07070C]' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              I want to buy
            </button>
            <button
              type="button"
              onClick={() => setAccountType('seller')}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                accountType === 'seller' 
                  ? 'bg-[#C9A84C] text-[#07070C]' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              I&apos;m a seller
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Name / Company</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="email@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white focus:outline-none focus:border-[#C9A84C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] text-[#07070C] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#E8C96A] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create my account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">Or simpler</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white text-[#07070C] py-4 rounded-xl font-bold hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            Continue with Google
          </button>

          <p className="text-center text-white/50 text-sm mt-6">
            Already have an account ?{' '}
            <Link href="/login" className="text-[#C9A84C] hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}