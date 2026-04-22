'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { m as motion } from 'framer-motion';

export default function AdminInitPage() {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const targetEmail = 'zickowiko@gmail.com';

  const makeAdmin = async () => {
    if (!user) return;
    if (user.email !== targetEmail) {
      setError(`Veuillez vous connecter avec l'adresse ${targetEmail}`);
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const userRef = doc(db!, 'users', user.uid);
      await updateDoc(userRef, {
        role: 'admin',
        isVerified: true
      });
      setStatus('success');
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      setStatus('error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07070C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070C] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#111111] border border-[#2A2A2A] rounded-3xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="text-[#C9A84C]" size={32} />
        </div>

        <h1 className="text-2xl text-white font-serif font-bold mb-2">Initialisation Admin</h1>
        <p className="text-[#A0A0A0] text-sm mb-8 text-pretty">
          Cette page permet de configurer le compte <span className="text-[#C9A84C] font-bold">{targetEmail}</span> comme Administrateur Principal.
        </p>

        {!user ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6 flex items-start gap-3 text-left">
            <AlertTriangle className="text-amber-500 shrink-0" size={18} />
            <p className="text-amber-500 text-xs">Vous devez être connecté pour continuer.</p>
          </div>
        ) : user.email !== targetEmail ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 flex items-start gap-3 text-left">
            <AlertTriangle className="text-red-500 shrink-0" size={18} />
            <p className="text-red-500 text-xs">
              Connecté en tant que: <span className="font-bold">{user.email}</span>. 
              Veuillez utiliser le compte correct.
            </p>
          </div>
        ) : null}

        {status === 'idle' && (
          <button
            onClick={makeAdmin}
            disabled={!user || user.email !== targetEmail}
            className="w-full bg-[#C9A84C] text-[#07070C] font-bold py-4 rounded-xl hover:bg-[#E8C96B] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
          >
            Devenir Administrateur
          </button>
        )}

        {status === 'loading' && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
          </div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl"
          >
            <CheckCircle className="text-green-500 mx-auto mb-3" size={32} />
            <p className="text-green-500 font-bold mb-4">Succès !</p>
            <p className="text-[#A0A0A0] text-xs mb-6 text-pretty">
              Votre compte a été promu Administrateur. Vous pouvez maintenant accéder au dashboard.
            </p>
            <a 
              href="/admin"
              className="inline-block bg-[#1A1A1A] text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-[#2A2A2A] transition-all border border-[#2A2A2A]"
            >
              Aller au Dashboard
            </a>
          </motion.div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
            <p className="text-red-500 text-xs">{error}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-white text-[10px] underline"
            >
              Réessayer
            </button>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-[#1E1E1E]">
          <p className="text-[10px] text-[#555555] italic">
            Une fois l&apos;opération terminée, il est recommandé de supprimer cette page pour des raisons de sécurité.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
