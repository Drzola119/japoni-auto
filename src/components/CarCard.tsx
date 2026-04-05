'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Eye, MapPin, Gauge, Fuel, Calendar, BadgeCheck, Star } from 'lucide-react';
import { useState } from 'react';
import { CarListing } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface Props {
  car: CarListing;
  index?: number;
}

export default function CarCard({ car, index = 0 }: Props) {
  const { t } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fuelLabel: Record<string, string> = {
    essence: t('fuel.essence'),
    diesel: t('fuel.diesel'),
    electrique: t('fuel.electrique'),
    hybride: t('fuel.hybride'),
    gpl: t('fuel.gpl'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="card group cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-dark-700">
        {car.images?.[0] && !imgError ? (
          <Image
            src={car.images[0]}
            alt={car.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #1a1a25, #252535)' }}>
            <span className="text-5xl">🚗</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {car.isPremium && (
            <span className="badge-premium flex items-center gap-1">
              <Star className="w-3 h-3" /> Premium
            </span>
          )}
          {car.isVerified && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full text-white"
                  style={{ background: 'rgba(16,185,129,0.85)' }}>
              <BadgeCheck className="w-3 h-3" /> {t('car.verified')}
            </span>
          )}
          {car.condition === 'neuf' && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full text-white"
                  style={{ background: 'rgba(59,130,246,0.85)' }}>
              {t('condition.neuf')}
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: liked ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
        >
          <Heart className={cn('w-4 h-4', liked ? 'fill-white text-white' : 'text-white')} />
        </button>

        {/* Views */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-white/80"
             style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '3px 8px', borderRadius: '8px' }}>
          <Eye className="w-3 h-3" />
          {car.viewCount || 0}
        </div>
      </div>

      {/* Content */}
      <Link href={`/car/${car.id}`} className="block p-4">
        {/* Title */}
        <h3 className="font-bold text-white text-base leading-snug mb-1 line-clamp-1 group-hover:text-orange-400 transition-colors">
          {car.title || `${car.brand} ${car.model} ${car.year}`}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <MapPin className="w-3 h-3" />
          {car.wilaya}
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Calendar, label: car.year?.toString() },
            { icon: Gauge, label: `${(car.mileage || 0).toLocaleString()} ${t('common.km')}` },
            { icon: Fuel, label: fuelLabel[car.fuel] || car.fuel },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <Icon className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">{t('car.price')}</p>
            <p className="text-xl font-extrabold" style={{ color: '#f97316' }}>
              {formatPrice(car.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">{car.sellerName}</p>
            <span className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
              Voir →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
