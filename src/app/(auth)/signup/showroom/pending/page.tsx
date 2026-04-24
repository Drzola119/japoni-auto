'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ShowroomPendingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 mx-auto mb-8"
        >
          <Clock className="w-20 h-20 text-[#C9A84C]" />
        </motion.div>

        <h1 className="text-3xl font-bold font-cormorant text-white mb-4">
          Demande en attente
        </h1>

        <p className="text-white/50 text-sm mb-4 leading-relaxed">
          Votre demande showroom est actuellement en cours d&apos;examen par notre équipe.
        </p>
        <p className="text-white/30 text-sm mb-8 leading-relaxed">
          Ce processus prend généralement entre 24 et 48 heures.
        </p>

        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Prochaines étapes
          </h2>
          <ul className="text-white/40 text-sm space-y-3 text-left">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-xs flex items-center justify-center font-bold">1</span>
              Examen du document
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-xs flex items-center justify-center font-bold">2</span>
              Vérification des informations
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-xs flex items-center justify-center font-bold">3</span>
              Notification par email
            </li>
          </ul>
        </div>

        <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-[#C9A84C] text-sm">
            <MessageCircle size={18} />
            Besoin d&apos;aide ? Contactez-nous sur WhatsApp
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 rounded-xl bg-[#C9A84C] text-black font-bold hover:bg-[#E8C96A] transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <p className="text-white/30 text-xs">
            Des questions ?{' '}
            <a href="mailto:contact@japoniauto.dz" className="text-[#C9A84C] hover:underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}