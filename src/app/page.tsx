'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, ChevronDown, Star, Shield, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { WILAYAS, CarListing } from '@/types';
import CarCard from '@/components/CarCard';
import { cn } from '@/lib/utils';

// Demo data for initial display before Firebase loads
const DEMO_CARS: CarListing[] = [
  {
    id: '1', title: 'Toyota Corolla Cross 2023 Full Options', brand: 'Toyota', model: 'Corolla Cross',
    year: 2023, price: 7500000, mileage: 12000, fuel: 'hybride', transmission: 'automatique',
    condition: 'neuf', wilaya: 'Alger', description: 'Voiture en excellent état, premiere main.',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80'],
    sellerId: '1', sellerName: 'Karim D.', sellerPhone: '0555123456',
    isPremium: true, isVerified: true, isSold: false, viewCount: 342, favoriteCount: 45,
    category: 'voiture', color: 'Blanc', createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
  {
    id: '2', title: 'Hyundai Tucson 2022 1.6 T-GDI', brand: 'Hyundai', model: 'Tucson',
    year: 2022, price: 5800000, mileage: 35000, fuel: 'essence', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Oran', description: 'SUV en très bon état.',
    images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80'],
    sellerId: '2', sellerName: 'Ahmed B.', sellerPhone: '0555234567',
    isPremium: false, isVerified: true, isSold: false, viewCount: 198, favoriteCount: 22,
    category: 'suv', color: 'Gris', createdAt: '2025-01-02', updatedAt: '2025-01-02',
  },
  {
    id: '3', title: 'Mercedes-Benz C 220 AMG Line 2021', brand: 'Mercedes-Benz', model: 'Classe C',
    year: 2021, price: 9200000, mileage: 55000, fuel: 'diesel', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Constantine', description: 'Mercedes premium, grand équipement.',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'],
    sellerId: '3', sellerName: 'Salim M.', sellerPhone: '0555345678',
    isPremium: true, isVerified: false, isSold: false, viewCount: 511, favoriteCount: 78,
    category: 'voiture', color: 'Noir', createdAt: '2025-01-03', updatedAt: '2025-01-03',
  },
  {
    id: '4', title: 'Volkswagen Tiguan 2023 R-Line', brand: 'Volkswagen', model: 'Tiguan',
    year: 2023, price: 8400000, mileage: 8000, fuel: 'essence', transmission: 'automatique',
    condition: 'neuf', wilaya: 'Sétif', description: 'Tiguan R-Line neuf.',
    images: ['https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=80'],
    sellerId: '4', sellerName: 'Yacine K.', sellerPhone: '0555456789',
    isPremium: false, isVerified: true, isSold: false, viewCount: 124, favoriteCount: 16,
    category: 'suv', color: 'Bleu', createdAt: '2025-01-04', updatedAt: '2025-01-04',
  },
  {
    id: '5', title: 'BMW Série 3 320i 2020', brand: 'BMW', model: 'Série 3',
    year: 2020, price: 7800000, mileage: 68000, fuel: 'essence', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Blida', description: 'BMW 320i, plein options.',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'],
    sellerId: '5', sellerName: 'Rachid A.', sellerPhone: '0555567890',
    isPremium: true, isVerified: true, isSold: false, viewCount: 287, favoriteCount: 41,
    category: 'voiture', color: 'Gris', createdAt: '2025-01-05', updatedAt: '2025-01-05',
  },
  {
    id: '6', title: 'Renault Duster 2022 4x4 Privilege', brand: 'Renault', model: 'Duster',
    year: 2022, price: 3600000, mileage: 42000, fuel: 'diesel', transmission: 'manuelle',
    condition: 'occasion', wilaya: 'Annaba', description: 'Duster 4x4, très bon état.',
    images: ['https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=800&q=80'],
    sellerId: '6', sellerName: 'Hassan L.', sellerPhone: '0555678901',
    isPremium: false, isVerified: false, isSold: false, viewCount: 93, favoriteCount: 11,
    category: '4x4', color: 'Rouge', createdAt: '2025-01-06', updatedAt: '2025-01-06',
  },
];

const STATS = [
  { value: '12,400+', label: 'Annonces actives', icon: '🚗' },
  { value: '32', label: 'Marques disponibles', icon: '⭐' },
  { value: '58', label: 'Wilayas couvertes', icon: '📍' },
];

export default function HomePage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: t('listings.filter.all') },
    { id: 'premium', label: t('listings.filter.premium') },
    { id: 'neuf', label: t('listings.filter.new') },
    { id: 'occasion', label: t('listings.filter.used') },
  ];

  const filteredCars = DEMO_CARS.filter(car => {
    if (activeFilter === 'premium') return car.isPremium;
    if (activeFilter === 'neuf') return car.condition === 'neuf';
    if (activeFilter === 'occasion') return car.condition === 'occasion';
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Animated background */}
        <div className="absolute inset-0">
          {/* Background image */}
          <div className="absolute inset-0"
               style={{
                 backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
               }} />
          <div className="hero-overlay absolute inset-0" />

          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
               style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse"
               style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', animationDelay: '1s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}
          >
            <Zap className="w-4 h-4" />
            Algérie&apos;s #1 Car Marketplace
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight mb-6"
          >
            {t('hero.title')}{' '}
            <span className="relative inline-block">
              <span style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t('hero.title.highlight')}
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-2 left-0 right-0 h-1 rounded-full origin-left"
                style={{ background: 'linear-gradient(90deg, #f97316, #f59e0b)' }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-10"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('hero.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-white text-base outline-none"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
            </div>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="sm:w-48 px-4 py-4 rounded-2xl text-white text-base outline-none cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <option value="" style={{ background: '#1a1a25' }}>Wilaya</option>
              {WILAYAS.map(w => (
                <option key={w} value={w} style={{ background: '#1a1a25' }}>{w}</option>
              ))}
            </select>
            <div className="sm:w-40 relative">
              <input
                type="number"
                placeholder={t('listings.filter.max')}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl text-white text-base outline-none"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
            </div>
            <Link
              href={`/listings?q=${searchQuery}&wilaya=${selectedWilaya}&max=${priceMax}`}
              className="btn-primary py-4 px-8 text-base rounded-2xl whitespace-nowrap"
            >
              <Search className="w-5 h-5" />
              {t('hero.btn.search')}
            </Link>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link href="/sell" className="btn-secondary py-3 px-6">
              {t('hero.btn.sell')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-8 mt-16 flex-wrap"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* ===== FEATURES STRIP ===== */}
      <section className="py-12" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.05), rgba(245,158,11,0.03))' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Annonces Vérifiées', desc: 'Toutes nos annonces passent par une vérification manuelle de notre équipe.' },
              { icon: Star, title: 'Meilleurs Prix', desc: 'Comparez les prix et trouvez les meilleures offres dans toute l\'Algérie.' },
              { icon: TrendingUp, title: 'Vente Rapide', desc: 'Publication instantanée et visibilité maximale pour vendre rapidement.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-6 rounded-2xl"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'rgba(249,115,22,0.12)' }}>
                  <Icon className="w-6 h-6" style={{ color: '#f97316' }} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LISTINGS SECTION ===== */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-orange-500 font-semibold text-sm mb-2 tracking-wider uppercase">Annonces récentes</p>
              <h2 className="section-title">
                {t('listings.title').split(' ').slice(0, -1).join(' ')}{' '}
                <span>{t('listings.title').split(' ').slice(-1)}</span>
              </h2>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    activeFilter === f.id
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  )}
                  style={activeFilter === f.id ? {
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 15px rgba(249,115,22,0.3)',
                  } : {}}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} />
            ))}
          </div>

          {/* View All */}
          <div className="text-center mt-12">
            <Link href="/listings" className="btn-secondary inline-flex py-4 px-10 text-base">
              {t('listings.btn.viewAll')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(245,158,11,0.04))' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Vendez votre voiture{' '}
              <span style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                rapidement
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Publiez votre annonce gratuitement en quelques minutes et atteignez des milliers d&apos;acheteurs potentiels dans toute l&apos;Algérie.
            </p>
            <Link href="/sell" className="btn-primary text-lg py-4 px-10 inline-flex">
              Publier une annonce gratuite <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
