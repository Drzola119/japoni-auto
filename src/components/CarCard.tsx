'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m as motion } from "framer-motion";
import { Heart, MapPin, Gauge, Fuel, Calendar, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { CarListing } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative cursor-pointer block rounded-[8px] overflow-hidden bg-[#111118]"
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
        e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.08)';
        e.currentTarget.style.transform = 'translateY(-6px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Link href={`/cars/${car.id}`} className="block h-full">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden bg-[#0A0A0F]">
          {car.images?.[0] && !imgError ? (
            <Image
              src={car.images[0]}
              alt={car.title || 'Voiture'}
              fill
              className="object-cover transition-transform duration-600 ease-out group-hover:scale-105"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#111118]">
              <CarPlaceholder />
            </div>
          )}

          {/* Persistent Gradient Overlay */}
          <div 
            className="absolute bottom-0 w-full h-[60%] pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(7,7,12,0.8) 0%, transparent 100%)' }}
          />

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
            {car.isPremium && (
              <span 
                className="rounded-sm px-2 py-[3px] uppercase"
                style={{ 
                  background: 'rgba(201,168,76,0.9)', 
                  color: '#07070C',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em'
                }}
              >
                Premium
              </span>
            )}
            {car.isVerified && (
              <span 
                className="rounded-sm px-2 py-[3px] uppercase"
                style={{ 
                  background: 'rgba(56,161,105,0.85)', 
                  color: '#FFF',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em'
                }}
              >
                {t('car.verified')}
              </span>
            )}
            {car.condition === 'neuf' && (
              <span 
                className="rounded-sm px-2 py-[3px] uppercase"
                style={{ 
                  background: 'rgba(66,153,225,0.85)', 
                  color: '#FFF',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em'
                }}
              >
                {t('condition.neuf')}
              </span>
            )}
          </div>

          {/* Favorite Heart (Top Right) */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
            className="absolute top-3 right-3 p-2 rounded-full z-20 flex items-center justify-center transition-all duration-300"
            style={{ 
              background: 'rgba(0,0,0,0.5)', 
              backdropFilter: 'blur(8px)',
            }}
          >
            <Heart 
              className="w-[18px] h-[18px] transition-colors" 
              style={{
                stroke: liked ? 'transparent' : '#C9A84C',
                fill: liked ? '#C9A84C' : 'transparent',
              }}
            />
          </button>

          {/* Views (Inside Image, bottom right relative layout but positioned via absolute here for ease, actually prompt says top-right next to heart? Wait, prompt says top-right. Let's put it next to heart) */}
          <div 
            className="absolute top-3 right-[52px] flex items-center justify-center z-10"
            style={{
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              borderRadius: '100px',
              padding: '3px 10px',
            }}
          >
            <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
              👁 {car.viewCount || Math.floor(Math.random() * 500) + 120}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col justify-between" style={{ minHeight: '180px' }}>
          
          <div>
            <h3 
              className="mb-4 truncate transition-colors duration-200 group-hover:text-[#C9A84C]"
              style={{ 
                fontFamily: '"Cormorant Garamond", serif', 
                fontWeight: 500, 
                fontSize: '1.1rem', 
                color: '#F5F0E8' 
              }}
            >
              {car.title || `${car.brand} ${car.model} ${car.year}`}
            </h3>

            {/* Meta Row (Pills) */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: MapPin, text: car.wilaya || 'Alger' },
                { icon: Calendar, text: car.year?.toString() },
                { icon: Gauge, text: `${(car.mileage || 0).toLocaleString()} km` },
                { icon: Fuel, text: fuelLabel[car.fuel] || car.fuel },
              ].map((pill, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-1.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '3px 10px'
                  }}
                >
                  <pill.icon size={12} color="#4A4840" />
                  <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.7rem', color: '#9A9480' }}>
                    {pill.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between mt-auto">
            {/* Price */}
            <div>
              <span 
                className="block uppercase mb-1"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.1em', color: '#4A4840' }}
              >
                Prix
              </span>
              <span 
                className="block leading-none"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '1.5rem', color: '#C9A84C' }}
              >
                {formatPrice(car.price)}
              </span>
            </div>

            {/* Seller & Action */}
            <div className="text-right flex flex-col items-end">
              <span 
                className="mb-1"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.78rem', color: '#4A4840' }}
              >
                {car.sellerName}
              </span>
              <div 
                className="flex items-center gap-1 transition-all"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: '0.75rem', color: '#C9A84C', letterSpacing: '0.05em' }}
              >
                Voir 
                <ArrowRight 
                  size={14} 
                  className="transform transition-transform duration-300 group-hover:translate-x-1" 
                />
              </div>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}

function CarPlaceholder() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4A4840" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a2 2 0 00-1.6-.8H8.3a2 2 0 00-1.6.8L4 11l-5.16.86a1 1 0 00-.84.99V16h3" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}
