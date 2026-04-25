'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, Gauge, Heart, MapPin, MessageSquare, Phone, Play, Share2, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CarListing } from '@/types';

interface VideoData {
  platform: string;
  videoId: string;
}

function getVideoEmbedUrl(videoData: VideoData | null): string | null {
  if (!videoData) return null;
  const { platform, videoId } = videoData;
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`;
    case 'facebook':
      return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/video/${videoId}&show_text=0&width=auto`;
    case 'instagram':
      return `https://www.instagram.com/p/${videoId}/embed`;
    case 'tiktok':
      return `https://www.tiktok.com/embed/v2/${videoId}`;
    case 'dailymotion':
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    default:
      return null;
  }
}

export default function CarDetailPage() {
  const params = useParams();
  const id = params.slug as string;

  const [listing, setListing] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  
  useEffect(() => {
    const fetchListing = async () => {
      if (!db || !id) return;
      try {
        const docRef = doc(db!, 'listings', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as CarListing;
          setListing(data);
          
          // Parse video data if present
          if (data.videoUrlRaw) {
            const parsed = parseVideoUrl(data.videoUrlRaw);
            setVideoData(parsed);
          }
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const parseVideoUrl = (url: string): VideoData | null => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (youtubeMatch) return { platform: 'youtube', videoId: youtubeMatch[1] };
    const facebookMatch = url.match(/facebook\.com\/.*\/videos\/(\d+)/);
    if (facebookMatch) return { platform: 'facebook', videoId: facebookMatch[1] };
    const instagramMatch = url.match(/instagram\.com\/reel\/([^/?]+)/);
    if (instagramMatch) return { platform: 'instagram', videoId: instagramMatch[1] };
    const tiktokMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    if (tiktokMatch) return { platform: 'tiktok', videoId: tiktokMatch[1] };
    const dailymotionMatch = url.match(/dailymotion\.com\/video\/([^_?]+)/);
    if (dailymotionMatch) return { platform: 'dailymotion', videoId: dailymotionMatch[1] };
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C9A84C] animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold font-cormorant mb-4">Listing not found</h1>
        <Link href="/cars" className="text-[#C9A84C] hover:underline">Back to catalog</Link>
      </div>
    );
  }

  const mainImage = listing.images[0] || 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-[#07070A] text-white pt-20 overflow-x-hidden">
      
      {/* Breadcrumb */}
      <div className="border-b border-white/5">
        <div className="container mx-auto px-4 max-w-7xl py-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/cars" className="hover:text-white transition-colors">Catalog</Link>
          <ChevronRight size={12} />
          <span className="text-[#C9A84C]">{listing.title}</span>
        </div>
      </div>

      {/* Hero Gallery Base */}
      <div className="w-full bg-black relative">
        <div className="aspect-[4/3] md:aspect-[16/7] lg:aspect-[21/9] relative overflow-hidden">
          <Image src={mainImage} alt={listing.title} fill className="object-cover opacity-90" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070A] via-transparent to-transparent" />
          
          <button className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-rose-500 hover:bg-black/60 transition-all">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 max-w-7xl -mt-12 md:-mt-20 relative z-10 pb-12 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Main Info (Left Col) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111116] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {listing.isPremium && <span className="px-3 py-1 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 rounded-md text-[10px] font-bold uppercase tracking-widest">Premium</span>}
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold uppercase tracking-widest text-white/70">
                  {listing.condition === 'neuf' ? 'Neuf' : 'Occasion (Excellent)'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-cormorant leading-tight mb-2">{listing.title}</h1>
              <div className="text-3xl font-bold text-[#E8C96A] font-inter mb-8">
                {listing.price.toLocaleString()} DZD
              </div>
              
              {/* Quick Specs Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-white/5">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Year</span>
                  <span className="text-base md:text-lg font-semibold">{listing.year}</span>
                </div>
                <div className="flex flex-col gap-2 md:border-l md:pl-4 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Mileage</span>
                  <span className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <Gauge size={16} className="text-[#C9A84C] w-4 h-4"/> 
                    {listing.mileage.toLocaleString()} km
                  </span>
                </div>
                <div className="flex flex-col gap-2 md:border-l md:pl-4 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Transmission</span>
                  <span className="text-base md:text-lg font-semibold capitalize">{listing.transmission}</span>
                </div>
                <div className="flex flex-col gap-2 md:border-l md:pl-4 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Fuel</span>
                  <span className="text-base md:text-lg font-semibold capitalize">{listing.fuel}</span>
                </div>
              </div>

              {/* Gallery Grid if more than 1 image */}
              {listing.images.length > 1 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {listing.images.slice(1).map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/5">
                      <Image src={img} alt={`${listing.title}-${idx}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-xl font-bold font-cormorant mb-4">Description</h3>
                <p className="text-white/60 leading-relaxed font-inter text-sm whitespace-pre-line">
                  {listing.description || 'No description provided.'}
                </p>
              </div>

              {/* Video Section */}
              {videoData && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold font-cormorant mb-4 flex items-center gap-2">
                    <Play size={20} className="text-[#C9A84C]" />
                    Presentation Video
                  </h3>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/5">
                    <iframe
                      src={getVideoEmbedUrl(videoData) || ''}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Seller Card (Right Col) */}
          <div className="space-y-6">
            <div className="bg-[#111116] border border-[#C9A84C]/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C] opacity-5 rounded-bl-full blur-2xl" />
              
              <h3 className="text-xs uppercase font-bold tracking-widest text-[#C9A84C] mb-6 flex items-center gap-2">
                <ShieldCheck size={16} /> 
                {listing.isVerified ? 'Professional Seller' : 'Private Seller'}
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center font-cormorant text-2xl font-bold text-white uppercase">
                  {listing.sellerName?.charAt(0) || 'V'}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{listing.sellerName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-white/50 mt-1 uppercase tracking-wider font-semibold">
                    <MapPin size={12} className="text-[#C9A84C]" /> {listing.wilaya}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full bg-[#E8C96A] text-[#111] font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-lg"
                >
                  <Phone size={18} /> 
                  {showPhone ? listing.sellerPhone || 'Not specified' : 'Show Phone Number'}
                </button>
                <button className="w-full bg-white/5 border border-white/10 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                  <MessageSquare size={18} /> Send Message
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 text-center text-[11px] text-white/40 uppercase tracking-wider font-semibold">
                Japoni Auto Member
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
                <Share2 size={16} /> Share Listing
              </button>
              <div className="w-px h-4 bg-white/10"></div>
              <button className="flex items-center gap-2 text-sm text-white/40 hover:text-rose-400 transition-colors">
                <CheckCircle2 size={16} /> Report
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
