'use client';

import { Search, SlidersHorizontal, MapPin, Gauge } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const inventory = [
  { id: '1', title: 'Mercedes-Benz G63 AMG', price: '45,000,000 DZD', year: 2024, mileage: '5,000 km', location: 'Alger', fuel: 'Essence', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80' },
  { id: '2', title: 'Range Rover Sport P530', price: '38,000,000 DZD', year: 2023, mileage: '12,000 km', location: 'Oran', fuel: 'Essence', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80' },
  { id: '3', title: 'Porsche Cayenne Turbo GT', price: '52,000,000 DZD', year: 2024, mileage: '2,500 km', location: 'Alger', fuel: 'Essence', image: 'https://images.unsplash.com/photo-1503376760356-0482922416b2?auto=format&fit=crop&q=80' },
  { id: '4', title: 'Audi RS6 Avant', price: '32,000,000 DZD', year: 2022, mileage: '28,000 km', location: 'Constantine', fuel: 'Essence', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0b41?auto=format&fit=crop&q=80' },
  { id: '5', title: 'BMW M8 Competition', price: '40,000,000 DZD', year: 2023, mileage: '15,000 km', location: 'Blida', fuel: 'Essence', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80' },
  { id: '6', title: 'Lexus LX 600', price: '35,000,000 DZD', year: 2023, mileage: '8,000 km', location: 'Alger', fuel: 'Essence', image: 'https://images.unsplash.com/photo-1609520778163-a1a2962b2701?auto=format&fit=crop&q=80' },
];

export default function CarsListings() {
  const [showFilters, setShowFilters] = useState(false);

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
                placeholder="Rechercher une marque, un modèle..." 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#C9A84C] font-medium"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors font-medium"
            >
              <SlidersHorizontal size={18} /> Filtres
            </button>
            <button className="md:w-32 w-full bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] rounded-xl py-4 font-bold shadow-[0_0_15px_rgba(201,168,76,0.2)] hover:opacity-90 transition-opacity">
              Rechercher
            </button>
          </div>

          {/* Animated Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 animate-in slide-in-from-top-4 duration-300">
              <select className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                <option>Toutes les marques</option>
                <option>Mercedes-Benz</option>
                <option>Range Rover</option>
                <option>Audi</option>
                <option>Porsche</option>
                <option>BMW</option>
              </select>
              <select className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                <option>Budget Maximum</option>
                <option>20,000,000 DZD</option>
                <option>30,000,000 DZD</option>
                <option>50,000,000 DZD</option>
              </select>
              <select className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                <option>Toutes les années</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
              <select className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                <option>Carburant</option>
                <option>Essence</option>
                <option>Diesel</option>
                <option>Hybride</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold font-cormorant">{inventory.length} Véhicules trouvés</h2>
          <select className="bg-transparent border-none text-white/60 text-sm focus:outline-none font-medium cursor-pointer">
            <option>Trier par: Plus récents</option>
            <option>Prix croissant</option>
            <option>Prix décroissant</option>
          </select>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {inventory.map((car) => (
            <Link href={`/cars/${car.id}`} key={car.id} className="group flex flex-col bg-[#111116] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C9A84C]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="relative aspect-[4/3] bg-black overflow-hidden shrink-0">
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <MapPin size={10} className="text-[#C9A84C]" /> {car.location}
                </div>
                <img src={car.image} alt={car.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold font-cormorant text-white group-hover:text-[#E8C96A] transition-colors line-clamp-1">{car.title}</h3>
                <p className="text-[#C9A84C] font-semibold text-lg mt-1 mb-4">{car.price}</p>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-semibold uppercase tracking-wider text-white/50 mb-6 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div> {car.year}
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge size={14} className="text-white/30" /> {car.mileage}
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div> {car.fuel}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/40">Vendeur vérifié</span>
                  <span className="text-[#C9A84C] text-[13px] font-bold group-hover:translate-x-1 transition-transform">Découvrir →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <button className="min-h-[44px] px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-sm hover:bg-white/10 transition-colors">
            Charger plus d'annonces
          </button>
        </div>

      </div>
    </div>
  );
}
