'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { m as motion, AnimatePresence, Variants } from "framer-motion";
import Link from 'next/link';
import { Search, Star, Shield, TrendingUp, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { WILAYAS, CarListing } from '@/types';
import CarCard from '@/components/CarCard';
import nextDynamic from 'next/dynamic';
import CarShowcase3D from '@/components/premium/CarShowcase3D';

import LoadingScreen from '@/components/LoadingScreen';

const HeroCanvas = nextDynamic(() => import('@/components/HeroCanvas'), { ssr: false });
// Removed dynamic import for LoadingScreen to ensure it's in the main bundle for instant appearance
import CountUp from 'react-countup';

const DEMO_CARS: CarListing[] = [
  {
    id: '1', title: 'Toyota Corolla Cross 2023 Full Options', brand: 'Toyota', model: 'Corolla Cross',
    year: 2023, price: 7500000, mileage: 12000, fuel: 'hybride', transmission: 'automatique',
    condition: 'neuf', wilaya: 'Alger', description: 'Voiture en excellent état, premiere main.',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80'],
    sellerId: '1', sellerName: 'Karim D.', sellerPhone: '0555123456',
    isPremium: true, isVerified: true, isSold: false, viewCount: 342, favoriteCount: 45,
    category: 'voiture', color: 'Blanc', status: 'approved', createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
  {
    id: '2', title: 'Hyundai Tucson 2022 1.6 T-GDI', brand: 'Hyundai', model: 'Tucson',
    year: 2022, price: 5800000, mileage: 35000, fuel: 'essence', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Oran', description: 'SUV en très bon état.',
    images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80'],
    sellerId: '2', sellerName: 'Ahmed B.', sellerPhone: '0555234567',
    isPremium: false, isVerified: true, isSold: false, viewCount: 198, favoriteCount: 22,
    category: 'suv', color: 'Gris', status: 'approved', createdAt: '2025-01-02', updatedAt: '2025-01-02',
  },
  {
    id: '3', title: 'Mercedes-Benz C 220 AMG Line 2021', brand: 'Mercedes-Benz', model: 'Classe C',
    year: 2021, price: 9200000, mileage: 55000, fuel: 'diesel', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Constantine', description: 'Mercedes premium, grand équipement.',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'],
    sellerId: '3', sellerName: 'Salim M.', sellerPhone: '0555345678',
    isPremium: true, isVerified: false, isSold: false, viewCount: 511, favoriteCount: 78,
    category: 'voiture', color: 'Noir', status: 'approved', createdAt: '2025-01-03', updatedAt: '2025-01-03',
  },
  {
    id: '4', title: 'Volkswagen Tiguan 2023 R-Line', brand: 'Volkswagen', model: 'Tiguan',
    year: 2023, price: 8400000, mileage: 8000, fuel: 'essence', transmission: 'automatique',
    condition: 'neuf', wilaya: 'Sétif', description: 'Tiguan R-Line neuf.',
    images: ['https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=80'],
    sellerId: '4', sellerName: 'Yacine K.', sellerPhone: '0555456789',
    isPremium: false, isVerified: true, isSold: false, viewCount: 124, favoriteCount: 16,
    category: 'suv', color: 'Bleu', status: 'approved', createdAt: '2025-01-04', updatedAt: '2025-01-04',
  },
  {
    id: '5', title: 'BMW Série 3 320i 2020', brand: 'BMW', model: 'Série 3',
    year: 2020, price: 7800000, mileage: 68000, fuel: 'essence', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Blida', description: 'BMW 320i, plein options.',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'],
    sellerId: '5', sellerName: 'Rachid A.', sellerPhone: '0555567890',
    isPremium: true, isVerified: true, isSold: false, viewCount: 287, favoriteCount: 41,
    category: 'voiture', color: 'Gris', status: 'approved', createdAt: '2025-01-05', updatedAt: '2025-01-05',
  },
  {
    id: '6', title: 'Renault Duster 2022 4x4 Privilege', brand: 'Renault', model: 'Duster',
    year: 2022, price: 3600000, mileage: 42000, fuel: 'diesel', transmission: 'manuelle',
    condition: 'occasion', wilaya: 'Annaba', description: 'Duster 4x4, très bon état.',
    images: ['https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=800&q=80'],
    sellerId: '6', sellerName: 'Hassan L.', sellerPhone: '0555678901',
    isPremium: false, isVerified: false, isSold: false, viewCount: 93, favoriteCount: 11,
    category: '4x4', color: 'Rouge', status: 'approved', createdAt: '2025-01-06', updatedAt: '2025-01-06',
  },
];

// Premium showcase cars for 3D scroll experience
const PREMIUM_SHOWCASE_CARS = [
  {
    id: 'showcase-1',
    title: 'Mercedes-Benz C 220 AMG',
    subtitle: 'Experience the perfect blend of luxury and performance with this stunning AMG Line. Premium features, pristine condition.',
    price: '9,200,000 DZD',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80',
    accentText: 'AMG',
    ctaHref: '/cars/3',
    badge: 'Premium',
  },
  {
    id: 'showcase-2',
    title: 'Toyota Corolla Cross Hybrid',
    subtitle: 'The future of driving with advanced hybrid technology. Fuel-efficient, reliable, and elegantly designed.',
    price: '7,500,000 DZD',
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=80',
    accentText: 'HYBRID',
    ctaHref: '/cars/1',
    badge: 'New',
  },
  {
    id: 'showcase-3',
    title: 'BMW Série 3 320i',
    subtitle: 'Ultimate driving pleasure in a sleek, sophisticated package. Full options, verified dealer.',
    price: '7,800,000 DZD',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80',
    accentText: 'BMW',
    ctaHref: '/cars/5',
    badge: 'Verified',
  },
];

const STATS = [
  { value: 12400, suffix: '+', label: 'Active Listings' },
  { value: 32, suffix: '', label: 'Available Brands' },
  { value: 58, suffix: '', label: 'Covered Wilayas' },
];

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const handleLoadingComplete = useCallback(() => {
    sessionStorage.setItem('japonLoaded', 'true');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Check if already loaded in this session
    if (sessionStorage.getItem('japonLoaded')) {
      setIsLoading(false);
    }
  }, []);





  const filters = [
    { id: 'all', label: 'All' },
    { id: 'premium', label: 'Premium' },
    { id: 'neuf', label: 'New' },
    { id: 'occasion', label: 'Used' },
  ];

  const filteredCars = DEMO_CARS.filter(car => {
    if (activeFilter === 'premium') return car.isPremium;
    if (activeFilter === 'neuf') return car.condition === 'neuf';
    if (activeFilter === 'occasion') return car.condition === 'occasion';
    return true;
  });

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>
      <motion.div
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
      >
      <div className="min-h-screen bg-[#07070C]">
        {/* ===== HERO SECTION ===== */}
        <section className="relative min-h-[60vh] md:min-h-[80vh] lg:min-h-[100dvh] flex items-center justify-center overflow-hidden">
        
        {/* Animated canvas background via component */}
        <HeroCanvas />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto w-full pt-20">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="flex flex-col items-center justify-center"
          >
            {/* Premium Brand Title */}
            <motion.h1
              initial={{ opacity: 0, letterSpacing: "0.2em", filter: "blur(10px)" }}
              animate={{ opacity: 1, letterSpacing: "0.5em", filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as const }}
              className="mb-4 text-[#C9A84C] text-center md:!tracking-[1em]"
              style={{ 
                fontFamily: '"Cormorant Garamond", serif', 
                fontWeight: 300, 
                fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                textShadow: '0 0 30px rgba(201, 168, 76, 0.3)'
              }}
            >
              JAPONI AUTO
            </motion.h1>

            {/* Eyebrow */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
              className="flex items-center gap-2 sm:gap-4 mb-6 md:mb-10 text-[#F5F0E8] opacity-80 text-[0.55rem] sm:text-[0.65rem] tracking-[0.2em] sm:tracking-[0.4em] uppercase font-normal"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              <span className="w-8 md:w-12 h-[1px] bg-[#C9A84C] opacity-40" />
              <span className="text-center">ALGÉRIE&apos;S PREMIUM AUTO MARKETPLACE</span>
              <span className="w-8 md:w-12 h-[1px] bg-[#C9A84C] opacity-40" />
            </motion.div>

            {/* Main Heading Text */}
            <h2 
              className="mb-10"
              style={{ textShadow: '0 2px 40px rgba(0,0,0,0.8)' }}
            >
              <span 
                className="block text-[#F5F0E8] leading-none mb-2"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(2rem, 6vw, 4rem)' }}
              >
                Find Your Perfect Car
              </span>
            </h2>

            {/* Subheading */}
            <p 
              className="mx-auto mb-10 md:mb-16 text-[#9A9480] px-4 text-[0.9rem] md:text-[1rem] leading-relaxed max-w-[48ch] font-light"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              Algeria&apos;s premium marketplace for buying and selling vehicles.
            </p>

            {/* Search Bar Container */}
            <div 
              className="w-full max-w-[780px] mx-auto rounded-[2px] p-2 sm:p-1.5 flex flex-col md:flex-row gap-0"
              style={{
                background: 'rgba(7,7,12,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(201,168,76,0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
              }}
            >
              {/* Query Input */}
              <div className="flex-1 px-4 py-3 md:py-3 relative text-left border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.06)]">
                <label className="block text-[#C9A84C] uppercase mb-1" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.2em' }}>Search</label>
                <div className="flex items-center">
                  <Search size={14} className="text-[#4A4840] mr-2 md:hidden" />
                  <input
                    type="text"
                    placeholder="Make, model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[#F5F0E8] placeholder-[#4A4840]"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="flex-1 px-4 py-3 md:py-3 relative text-left border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.06)]">
                <label className="block text-[#C9A84C] uppercase mb-1" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.2em' }}>Location</label>
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[#F5F0E8] appearance-none cursor-pointer"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.9rem' }}
                >
                  <option value="" style={{ background: '#0A0A0F', color: '#9A9480' }}>All of Algeria</option>
                  {WILAYAS.map(w => (
                    <option key={w} value={w} style={{ background: '#0A0A0F' }}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Price Max Input */}
              <div className="flex-1 px-4 py-3 md:py-3 relative text-left border-b md:border-b-0 border-[rgba(255,255,255,0.06)]">
                <label className="block text-[#C9A84C] uppercase mb-1" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.2em' }}>Max Budget</label>
                <input
                  type="number"
                  placeholder="Unlimited"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[#F5F0E8] placeholder-[#4A4840]"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.9rem' }}
                />
              </div>

              {/* Search Button */}
              <Link
                href={`/cars?q=${searchQuery}&wilaya=${selectedWilaya}&max=${priceMax}`}
                className="group flex items-center justify-center rounded-[2px] px-8 py-4 md:py-3 mt-0 transition-all duration-250 cursor-pointer md:min-w-[120px]"
                style={{
                  background: '#C9A84C',
                  color: '#07070C'
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  SHOW
                </span>
              </Link>
            </div>

            {/* Vendre ma voiture link */}
            <Link 
              href="/seller-dashboard/listings/new"
              className="mt-6 flex items-center gap-2 group transition-colors duration-200"
              style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.85rem', color: '#9A9480' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F5F0E8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9A9480'}
            >
              Sell My Car
              <ArrowRightIcon className="w-3 h-3 text-[#C9A84C] transform group-hover:translate-x-1 transition-transform" />
            </Link>

          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section 
        className="w-full py-12"
        style={{
          background: 'rgba(201,168,76,0.04)',
          borderTop: '1px solid rgba(201,168,76,0.1)',
          borderBottom: '1px solid rgba(201,168,76,0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-0">
          {STATS.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              className="flex flex-col items-center text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div 
                className="mb-1 text-[#C9A84C] text-[2.5rem] md:text-[3.5rem] leading-none font-light"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                <CountUp end={stat.value} duration={2.5} separator="," />
                {stat.suffix}
              </div>
              <div 
                className="text-[#4A4840] uppercase"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.2em' }}
              >
                {stat.label}
              </div>
              {/* Divider (hide on last item and optionally handle mobile grid borders) */}
              {i < STATS.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-[rgba(255,255,255,0.06)]" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== PREMIUM 3D SHOWCASE ===== */}
      <CarShowcase3D items={PREMIUM_SHOWCASE_CARS} />

      {/* ===== FEATURES ROW ===== */}
      <section className="py-24 fade-up-section">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
              {[
                { icon: Shield, title: 'Verified Listings', desc: 'Every transaction is approved by our specialized team to guarantee authenticity and absolute security.' },
                { icon: Star, title: 'Premium Excellence', desc: 'Access the most prestigious vehicles with detailed listings and certified sellers.' },
                { icon: TrendingUp, title: 'Exclusive Sales', desc: 'Exceptional visibility for your vehicle to a targeted and serious clientele.' },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div 
                  key={title} 
                  variants={fadeUpVariants}
                  className="group p-6 md:p-10 rounded-[8px] transition-all duration-300 relative bg-[rgba(255,255,255,0.02)]"
                  style={{
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(201,168,76,0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="mb-6 h-[48px] flex flex-col justify-between">
                  <Icon className="w-[28px] h-[28px] text-[#C9A84C]" strokeWidth={1.5} />
                  {/* Decorative gold line */}
                  <div className="w-[48px] h-[1px] bg-[#C9A84C] mt-4" />
                </div>
                <h3 
                  className="mb-3 text-[#F5F0E8]"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: '1.3rem' }}
                >
                  {title}
                </h3>
                <p 
                  className="text-[#9A9480]"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '0.875rem', lineHeight: 1.8 }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CAR LISTINGS SECTION ===== */}
      <section className="py-24 px-4 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <p 
                className="uppercase mb-2 text-[#C9A84C]"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: '0.65rem', letterSpacing: '0.3em' }}
              >
                Latest Listings
              </p>
              <h2 
                className="text-[#F5F0E8] text-[2rem] md:text-[2.5rem] font-light"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                Featured Vehicles
              </h2>
            </motion.div>
            
            {/* Filter Tabs */}
            <motion.div 
              className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide no-scrollbar"
              style={{ width: '100%', WebkitOverflowScrolling: 'touch' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            >
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="transition-all duration-300"
                  style={{
                    background: activeFilter === f.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                    border: `1px solid ${activeFilter === f.id ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: activeFilter === f.id ? '#C9A84C' : '#4A4840',
                    borderRadius: '2px',
                    padding: '0.4rem 1rem',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== f.id) {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                      e.currentTarget.style.color = '#9A9480';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== f.id) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = '#4A4840';
                    }
                  }}
                >
                  {f.label}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Grid */}
          <Suspense fallback={<CarCardSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCars.map((car, i) => (
                <CarCard key={car.id} car={car} index={i} />
              ))}
            </div>
          </Suspense>

          {/* View All */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link 
              href="/cars" 
              className="inline-flex transition-all duration-300"
              style={{
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#C9A84C',
                borderRadius: '2px',
                padding: '0.875rem 3rem',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 500,
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
                e.currentTarget.style.borderColor = '#C9A84C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
              }}
            >
              View All Listings <ArrowRightIcon className="w-4 h-4 ml-2 my-auto" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== SELL CTA SECTION ===== */}
      <section 
        className="w-full text-center py-16 md:py-28 px-4"
        style={{ 
          background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(7,7,12,0) 50%)',
          borderTop: '1px solid rgba(201,168,76,0.1)',
          borderBottom: '1px solid rgba(201,168,76,0.1)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="mb-6">
            <span 
              className="text-[#F5F0E8] block text-[2.5rem] md:text-[3.5rem] font-light leading-[1.1]" 
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              Sell Your Car{' '}
            </span>
            <span 
              className="text-[#C9A84C] italic text-[2.5rem] md:text-[3.5rem] font-normal leading-[1.1]" 
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              Quickly
            </span>
          </h2>
          
          <p 
            className="mb-10 mx-auto text-[#9A9480]"
            style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '1rem', maxWidth: '52ch' }}
          >
            Post your listing for free in minutes and reach an exclusivity of premium buyers selected across Algeria.
          </p>
          
          <Link 
            href="/seller-dashboard/listings/new" 
            className="inline-block transition-all duration-250 cursor-pointer"
            style={{
              background: '#C9A84C',
              color: '#07070C',
              borderRadius: '2px',
              padding: '1rem 3.5rem',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              boxShadow: '0 0 0 0 rgba(201,168,76,0.4)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(201,168,76,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 0 0 rgba(201,168,76,0.4)';
            }}
          >
            Start Your Evaluation
          </Link>
        </motion.div>
      </section>


      </div>
      </motion.div>
    </>
  );
}

function CarCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="h-64 rounded-[8px] shimmer" 
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        />
      ))}
    </div>
  );
}
