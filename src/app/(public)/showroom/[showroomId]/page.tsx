'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Shield,
  Loader2,
  Car
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import { User, CarListing } from '@/types';

const TIER_BADGE = {
  bronze: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Bronze' },
  silver: { bg: 'bg-gray-400/20', text: 'text-gray-300', label: 'Silver' },
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Gold' },
};

export default function PublicShowroomPage() {
  const params = useParams();
  const showroomId = params.showroomId as string;

  const [showroom, setShowroom] = useState<User | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowroom = async () => {
      if (!db || !showroomId) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', showroomId));
        if (userDoc.exists()) {
          const data = userDoc.data() as User;
          if (data.role === 'showroom') {
            setShowroom(data);
            
            const listingsQuery = query(
              collection(db, 'listings'),
              where('sellerId', '==', showroomId),
              where('status', '==', 'approved'),
              where('isExpired', '==', false),
              orderBy('createdAt', 'desc'),
              limit(20)
            );
            const listingsSnap = await getDocs(listingsQuery);
            setListings(listingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as CarListing)));
          }
        }
      } catch (error) {
        console.error('Error fetching showroom:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowroom();
  }, [showroomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C9A84C] animate-spin" />
      </div>
    );
  }

  if (!showroom || showroom.role !== 'showroom' || showroom.status !== 'active') {
    return (
      <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold font-cormorant mb-4">Showroom not found</h1>
        <Link href="/cars" className="text-[#C9A84C] hover:underline">Back to catalog</Link>
      </div>
    );
  }

  const tier = showroom.showroomTier || 'bronze';
  const tierStyle = TIER_BADGE[tier];

  return (
    <div className="min-h-screen bg-[#07070A] text-white">
      <div className="relative h-80">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C]/10 to-[#07070A]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        
        <div className="container mx-auto px-4 max-w-7xl pt-32 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end gap-8">
            <div className="w-32 h-32 rounded-3xl bg-[#111] border-4 border-[#C9A84C] flex items-center justify-center">
              <Building2 className="w-16 h-16 text-[#C9A84C]" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold font-cormorant">{showroom.showroomName}</h1>
                {showroom.isVerified && (
                  <Shield className="text-[#C9A84C]" size={24} />
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tierStyle.bg} ${tierStyle.text}`}>
                  {tierStyle.label}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-6 text-white/50 text-sm">
                {showroom.showroomAddress && (
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#C9A84C]" />
                    {showroom.showroomAddress}
                  </span>
                )}
                {showroom.showroomWilaya && (
                  <span>{showroom.showroomWilaya}</span>
                )}
                {showroom.phone && (
                  <span className="flex items-center gap-2">
                    <Phone size={16} className="text-[#C9A84C]" />
                    {showroom.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <a 
                href={`tel:${showroom.phone}`}
                className="bg-[#C9A84C] text-[#111] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#E8C96A] transition-colors"
              >
                <Phone size={18} />
                Call
              </a>
              {showroom.whatsapp && (
                <a 
                  href={`https://wa.me/${showroom.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500/20 text-green-400 border border-green-500/30 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-500/30 transition-colors"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-white/5">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          <div className="flex gap-12">
            <div>
              <span className="text-[#C9A84C] text-2xl font-bold">{listings.length}</span>
              <span className="text-white/40 text-sm ml-2">vehicles</span>
            </div>
            <div>
              <span className="text-white/40 text-2xl font-bold">{showroom.totalListings || 0}</span>
              <span className="text-white/40 text-sm">published</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-12">
        <h2 className="text-2xl font-bold font-cormorant mb-6 flex items-center gap-3">
          <Car size={24} className="text-[#C9A84C]" />
          Vehicles for Sale
        </h2>

        {listings.length === 0 ? (
          <div className="bg-[#111] rounded-2xl border border-white/5 p-12 text-center">
            <Car className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No vehicles for sale at this time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/cars/${listing.id}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden group"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={listing.images[0] || 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80'}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {listing.isPremium && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-bold uppercase rounded">
                        Premium
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white truncate">{listing.title}</h3>
                    <p className="text-[#E8C96A] font-bold mt-1">
                      {listing.price.toLocaleString()} DZD
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-white/40 text-xs">
                      <span>{listing.year}</span>
                      <span>{listing.mileage.toLocaleString()} km</span>
                      <span className="capitalize">{listing.transmission}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}