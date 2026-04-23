'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Tag, 
  Building2, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  Calendar,
  ImageIcon,
  Shield,
  Star
} from 'lucide-react';

export default function SignupRolePage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const roles = [
    {
      id: 'buyer',
      title: 'Acheteur',
      subtitle: 'Parcourez des milliers d\'annonces et trouvez votre voiture idéale',
      icon: Search,
      color: 'blue',
      features: [
        'Accès gratuit à toutes les annonces',
        'Contactez directement les vendeurs',
        'Sauvegardez vos favoris',
      ],
      buttonText: "S'inscrire comme Acheteur",
      buttonLink: '/auth/signup/buyer',
      badge: null,
    },
    {
      id: 'seller',
      title: 'Vendeur Particulier',
      subtitle: 'Publiez votre annonce et vendez votre véhicule rapidement',
      icon: Tag,
      color: 'green',
      features: [
        '1 annonce gratuite par jour',
        '1 photo par annonce',
        'Approbation instantanée',
      ],
      buttonText: "S'inscrire comme Vendeur",
      buttonLink: '/auth/signup/seller',
      badge: 'Gratuit',
    },
    {
      id: 'showroom',
      title: 'Showroom Professionnel',
      subtitle: 'Gérez votre stock et touchez des milliers d\'acheteurs potentiels',
      icon: Building2,
      color: 'amber',
      features: [
        'Jusqu\'à 20 annonces par jour',
        '4 photos + lien vidéo par annonce',
        'Badge Showroom Vérifié',
        'Profil showroom dédié',
      ],
      buttonText: 'Créer un compte Showroom',
      buttonLink: '/auth/signup/showroom',
      badge: 'Premium',
    },
  ];

  const colorStyles = {
    blue: {
      bg: 'bg-blue-500',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
      border: 'border-blue-500/30',
      text: 'text-blue-500',
      bgLight: 'bg-blue-500/10',
    },
    green: {
      bg: 'bg-green-500',
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
      border: 'border-green-500/30',
      text: 'text-green-500',
      bgLight: 'bg-green-500/10',
    },
    amber: {
      bg: 'bg-amber-500',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
      border: 'border-amber-500/30',
      text: 'text-amber-500',
      bgLight: 'bg-amber-500/10',
    },
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-8 h-8 rounded-lg bg-[#C9A84C] flex items-center justify-center text-[#07070C] font-bold shadow-[0_0_15px_rgba(201,168,76,0.3)]">
            JA
          </div>
          <span className="text-white font-serif text-xl tracking-[0.15em] font-light">
            JAPONI <span className="text-[#C9A84C] font-bold">AUTO</span>
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Rejoignez <span className="text-[#C9A84C]">Japoni Auto</span>
          </h1>
          <p className="text-[#A0A0A0] text-lg">
            Choisissez votre type de compte pour commencer
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const colors = colorStyles[role.color as keyof typeof colorStyles];
            const isHovered = hoveredCard === role.id;

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(role.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative bg-[#111111] border rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                  isHovered ? colors.border + ' ' + colors.glow : 'border-[#2A2A2A]'
                }`}
              >
                {/* Badge */}
                {role.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                    role.badge === 'Gratuit' ? 'bg-green-500 text-white' : 'bg-amber-500 text-black'
                  }`}>
                    {role.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${colors.bgLight} flex items-center justify-center mb-4`}>
                  <Icon size={28} className={colors.text} />
                </div>

                {/* Title */}
                <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
                  {role.title}
                </h2>

                {/* Subtitle */}
                <p className="text-[#A0A0A0] text-sm mb-4">
                  {role.subtitle}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {role.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#A0A0A0]">
                      <CheckCircle2 size={16} className={colors.text + ' flex-shrink-0 mt-0.5'} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Link
                  href={role.buttonLink}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    colors.bgLight + ' border ' + colors.border + ' ' + colors.text + ' hover:' + colors.bg
                  } hover:text-white`}
                >
                  {role.buttonText}
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-[#A0A0A0]">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-[#C9A84C] hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}