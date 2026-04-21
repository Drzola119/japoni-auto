'use client';

import { Heart, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Using a mock array since we don't have real data populated yet
const mockFavorites = [
  { id: '1', title: 'Mercedes G63 AMG', price: '45,000,000 DZD', year: 2023, mileage: '12,000 km', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80' },
  { id: '2', title: 'Range Rover SV', price: '38,000,000 DZD', year: 2024, mileage: '5,000 km', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80' },
];

export default function FavoritesPage() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-8 bg-[#07070A] text-white">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-cormorant tracking-wide flex items-center gap-3">
              Mes Favoris <Heart className="text-rose-500 fill-rose-500" />
            </h1>
            <p className="text-white/50 text-sm mt-1">Retrouvez les véhicules que vous avez sauvegardés.</p>
          </div>
          <Link href="/cars" className="bg-white/5 text-white/80 hover:text-white hover:bg-white/10 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <Search size={16} /> Parcourir les annonces
          </Link>
        </div>

        {mockFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {mockFavorites.map((car) => (
              <div key={car.id} className="group relative bg-[#111116] rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300">
                <button className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                  <Heart size={16} className="fill-current" />
                </button>
                <div className="relative aspect-[4/3] bg-black overflow-hidden">
                  <Image src={car.image} alt={car.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <div className="text-lg font-bold font-cormorant text-white mb-1 group-hover:text-[#C9A84C] transition-colors">{car.title}</div>
                  <div className="text-xl font-semibold text-[#E8C96A] mb-4">{car.price}</div>
                  <div className="flex items-center gap-3 text-xs text-white/50 uppercase tracking-widest font-semibold">
                    <span>{car.year}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span>{car.mileage}</span>
                  </div>
                  <Link href={`/cars/${car.id}`} className="block w-full text-center mt-5 py-2.5 rounded-lg border border-white/10 text-white/80 text-sm font-medium hover:bg-white hover:text-[#111] hover:border-white transition-all">
                    Voir les détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111116] border border-white/5 rounded-3xl p-16 text-center">
            <Heart size={48} className="mx-auto text-white/10 mb-6" />
            <h2 className="text-xl font-bold font-cormorant mb-2">Aucun favori pour le moment</h2>
            <p className="text-white/50 text-sm max-w-sm mx-auto mb-8">Vous n&apos;avez pas encore sauvegardé de véhicule. Parcourez nos annonces et cliquez sur le cœur pour les retrouver ici.</p>
            <Link href="/cars" className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-6 py-3 rounded-xl text-sm font-bold inline-block hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all">
              Découvrir les véhicules
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
