'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Gauge, Fuel, Calendar, Phone, MessageCircle, Heart, Share2, BadgeCheck, Star, ArrowLeft, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { CarListing } from '@/types';

// Demo car for static display
const DEMO_CAR: CarListing = {
  id: '1', title: 'Toyota Corolla Cross 2023 Full Options - Hybride',
  brand: 'Toyota', model: 'Corolla Cross', year: 2023, price: 7500000,
  mileage: 12000, fuel: 'hybride', transmission: 'automatique', condition: 'neuf',
  wilaya: 'Alger', color: 'Blanc',
  description: `Toyota Corolla Cross 2023 en parfait état. Première main, jamais accidentée.

Équipements :
• Climatisation automatique bizone
• Caméra de recul 360°
• Navigation GPS intégrée
• Toit panoramique
• Sièges chauffants et ventilés
• Régulateur de vitesse adaptatif
• Système d'alerte de franchissement de ligne
• Chargement sans fil
• Jantes alliage 18"

Motorisation hybride, très économique à l'usage. Livret d'entretien complet, tous les services effectués chez Toyota.`,
  images: [
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=80',
    'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?w=1200&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80',
  ],
  sellerId: '1', sellerName: 'Karim Djebbar', sellerPhone: '0555 12 34 56',
  sellerWhatsapp: '+213555123456',
  isPremium: true, isVerified: true, isSold: false, viewCount: 342, favoriteCount: 45,
  category: 'voiture', firstOwner: true, warranty: true,
  createdAt: '2025-01-15', updatedAt: '2025-01-15',
};

export default function CarDetailPage() {
  const { t } = useLanguage();
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const car = DEMO_CAR;

  const specs = [
    { label: t('car.year'), value: car.year, icon: Calendar },
    { label: t('car.mileage'), value: `${car.mileage?.toLocaleString()} km`, icon: Gauge },
    { label: t('car.fuel'), value: t(`fuel.${car.fuel}`), icon: Fuel },
    { label: t('car.transmission'), value: t(`transmission.${car.transmission}`), icon: MapPin },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link href="/listings" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux annonces
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left – Images + Details */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-3">
              <Image src={car.images[activeImg]} alt={car.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              {/* Arrows */}
              {car.images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => (i - 1 + car.images.length) % car.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={() => setActiveImg(i => (i + 1) % car.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {car.isPremium && <span className="badge-premium flex items-center gap-1"><Star className="w-3 h-3" /> Premium</span>}
                {car.isVerified && <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: 'rgba(16,185,129,0.85)' }}><BadgeCheck className="w-3 h-3" /> Vérifié</span>}
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-white text-xs px-3 py-1.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                <Eye className="w-3.5 h-3.5" /> {car.viewCount} vues
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {car.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all ${activeImg === i ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-dark-900' : 'opacity-60 hover:opacity-100'}`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="mt-8 rounded-2xl p-6" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-white font-bold text-lg mb-4">Description</h2>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{car.description}</p>
            </div>
          </div>

          {/* Right – Info + Contact */}
          <div className="lg:col-span-2">
            {/* Title & Price */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-6 mb-4" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-xl font-bold text-white leading-tight">{car.title}</h1>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setLiked(!liked)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: liked ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: liked ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)' }}>
                    <Heart className={`w-5 h-5 ${liked ? 'fill-red-400 text-red-400' : 'text-slate-400'}`} />
                  </button>
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Share2 className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                <MapPin className="w-4 h-4 text-orange-500" /> {car.wilaya}
              </div>

              {/* Price */}
              <div className="price-tag mb-4">
                <span className="text-3xl font-black" style={{ color: '#f97316' }}>{formatPrice(car.price)}</span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3">
                {specs.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-slate-500 text-xs">{label}</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{String(value)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Seller Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-white font-bold mb-4">Vendeur</h2>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg"
                     style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  {car.sellerName.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold">{car.sellerName}</p>
                  <p className="text-slate-400 text-xs">Vendeur particulier</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a href={`tel:${car.sellerPhone}`} className="btn-primary text-center py-3.5">
                  <Phone className="w-4 h-4" />
                  {car.sellerPhone}
                </a>
                {car.sellerWhatsapp && (
                  <a href={`https://wa.me/${car.sellerWhatsapp?.replace(/\D/g, '')}`}
                     target="_blank" rel="noopener noreferrer"
                     className="btn-secondary text-center py-3.5"
                     style={{ borderColor: 'rgba(37,211,102,0.3)', color: '#25d366' }}>
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
