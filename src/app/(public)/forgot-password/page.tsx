'use client';

import { useState } from 'react';
import { m as motion } from "framer-motion";
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070A] p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A84C]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Retour à la connexion
        </Link>
        
        <div className="bg-[#111116] border border-white/5 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Carbon Fiber subtle overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,1) 0deg 90deg, transparent 90deg 180deg)', backgroundSize: '4px 4px' }}></div>

          <div className="relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A84C]/20 to-transparent border border-[#C9A84C]/30 flex items-center justify-center text-[#E8C96A] mb-6">
            <KeyRound className="w-6 h-6" />
          </div>
          
          <h1 className="relative z-10 text-3xl font-bold text-white mb-2 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Mot de passe oublié ?
          </h1>
          
          {sent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative z-10">
              <p className="text-white/60 leading-relaxed text-sm font-inter">
                Un email contenant les instructions pour réinitialiser votre mot de passe a été envoyé à <strong>{email}</strong>.
              </p>
              <button 
                onClick={() => setSent(false)}
                className="text-[#C9A84C] hover:text-[#E8C96A] text-sm font-medium transition-colors"
              >
                Essayer avec une autre adresse email
              </button>
            </motion.div>
          ) : (
            <div className="relative z-10">
              <p className="text-white/60 leading-relaxed text-sm mb-8 font-inter">
                Entrez l&apos;adresse email associée à votre compte, et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6 font-inter">
                <div>
                  <label className="text-white/60 text-sm font-medium mb-2 block uppercase tracking-wider text-[11px]">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#C9A84C] transition-colors" />
                    <input 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      type="email" 
                      placeholder="votre@email.com" 
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-[#C9A84C] disabled:opacity-50 transition-all font-medium" 
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !email} 
                  className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 shadow-[0_0_15px_rgba(201,168,76,0.2)] disabled:opacity-50 transition-all duration-300"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
