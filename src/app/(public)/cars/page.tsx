'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Gauge, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { CarListing, CAR_BRANDS } from '@/types';

export default function CarsListings() {
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    maxPrice: '',
    year: '',
    fuel: '',
  });

  useEffect(() => {
    const fetchListings = async () => {
      if (!db) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedListings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CarListing[];
        setListings(fetchedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = !filters.brand || listing.brand === filters.brand;
    const matchesPrice = !filters.maxPrice || listing.price <= parseInt(filters.maxPrice);
    const matchesYear = !filters.year || listing.year === parseInt(filters.year);
    const matchesFuel = !filters.fuel || listing.fuel === filters.fuel;

    return matchesSearch && matchesBrand && matchesPrice && matchesYear && matchesFuel;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#07070A] text-white">
      
      {/* Header Search Banner */}
      <div className="bg-[#111116] border-y border-white/5 py-8 mb-8 sticky top-[72px] z-30 shadow-2xl">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une marque, un modèle..." 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#C9A84C] font-medium"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`md:w-auto w-full flex items-center justify-center gap-2 px-6 py-4 border rounded-xl transition-colors font-medium ${
                showFilters ? 'bg-[#C9A84C] text-[#111] border-[#C9A84C]' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal size={18} /> Filtres
            </button>
          </div>

          {/* Animated Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 animate-in slide-in-from-top-4 duration-300">
              <select 
                value={filters.brand}
                onChange={(e) => setFilters({...filters, brand: e.target.value})}
                className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="">Toutes les marques</option>
                {CAR_BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <select 
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="">Budget Maximum</option>
                <option value="5000000">5,000,000 DZD</option>
                <option value="10000000">10,000,000 DZD</option>
                <option value="20000000">20,000,000 DZD</option>
                <option value="30000000">30,000,000 DZD</option>
                <option value="50000000">50,000,000 DZD</option>
              </select>
              <select 
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
                className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="">Toutes les années</option>
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select 
                value={filters.fuel}
                onChange={(e) => setFilters({...filters, fuel: e.target.value})}
                className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="">Carburant</option>
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybride">Hybride</option>
                <option value="electrique">Électrique</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold font-cormorant">
            {loading ? 'Recherche...' : `${filteredListings.length} Véhicules trouvés`}
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-[#C9A84C] animate-spin" />
            <p className="text-white/40 font-medium">Chargement des annonces...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredListings.map((car) => (
              <Link href={`/cars/${car.id}`} key={car.id} className="group flex flex-col bg-[#111116] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C9A84C]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="relative aspect-[4/3] bg-black overflow-hidden shrink-0">
                  <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                    <MapPin size={10} className="text-[#C9A84C]" /> {car.wilaya}
                  </div>
                  <Image src={car.images[0] || 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80'} alt={car.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold font-cormorant text-white group-hover:text-[#E8C96A] transition-colors line-clamp-1">{car.title}</h3>
                  <p className="text-[#C9A84C] font-semibold text-lg mt-1 mb-4">{car.price.toLocaleString()} DZD</p>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-semibold uppercase tracking-wider text-white/50 mb-6 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div> {car.year}
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge size={14} className="text-white/30" /> {car.mileage.toLocaleString()} km
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div> {car.fuel}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/40">{car.isVerified ? 'Vendeur vérifié' : 'Particulier'}</span>
                    <span className="text-[#C9A84C] text-[13px] font-bold group-hover:translate-x-1 transition-transform">Découvrir →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">Aucun véhicule ne correspond à vos critères.</p>
            <button 
              onClick={() => {setSearchTerm(''); setFilters({brand: '', maxPrice: '', year: '', fuel: ''})}}
              className="mt-4 text-[#C9A84C] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
