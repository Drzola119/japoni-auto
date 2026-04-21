'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle2, X, Loader2 } from 'lucide-react';
import { CAR_BRANDS, WILAYAS } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function NewListing() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    title: '',
    price: '',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    mileage: '',
    fuel: 'essence',
    transmission: 'automatique',
    condition: 'occasion',
    wilaya: '16 - Alger',
    description: '',
    color: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Vous devez être connecté');
    if (images.length === 0) return toast.error('Ajoutez au moins une photo');
    
    setLoading(true);
    try {
      if (!db || !storage || !user) {
        throw new Error('Service Firebase non initialisé ou utilisateur non connecté');
      }

      // 1. Upload Images
      const imageUrls = await Promise.all(
        images.map(async (file, index) => {
          const storageRef = ref(storage!, `listings/${user.uid}/${Date.now()}-${index}`);
          const uploadResult = await uploadBytes(storageRef, file);
          return getDownloadURL(uploadResult.ref);
        })
      );

      // 2. Save to Firestore
      const listingData = {
        ...form,
        year: parseInt(form.year),
        price: parseInt(form.price),
        mileage: parseInt(form.mileage),
        images: imageUrls,
        sellerId: user.uid,
        sellerName: user.displayName,
        sellerEmail: user.email,
        isVerified: user.isVerified || false,
        isSold: false,
        viewCount: 0,
        favoriteCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db!, 'listings'), listingData);

      // 3. Update User Stats
      await updateDoc(doc(db!, 'users', user.uid), {
        totalListings: increment(1)
      });

      toast.success('Annonce publiée avec succès !');
      router.push(`/cars/${docRef.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-20">
      
      <div>
        <h1 className="text-3xl font-bold font-cormorant text-white">Publier un véhicule</h1>
        <p className="text-white/50 text-sm mt-1">Remplissez les détails pour mettre votre véhicule en vitrine.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Photos Section */}
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Photos du véhicule ({images.length})</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                <Image src={preview} alt="preview" fill className="object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-rose-500 transition-colors"
                >
                  <X size={14} />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-[10px] text-center text-white font-bold uppercase tracking-wider">Couverture</div>
                )}
              </div>
            ))}
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center hover:bg-white/5 hover:border-[#C9A84C]/50 transition-colors group"
            >
              <UploadCloud className="text-white/20 group-hover:text-[#C9A84C] transition-colors" size={24} />
              <span className="text-[10px] uppercase font-bold text-white/40 mt-2">Ajouter</span>
            </button>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Basic Info */}
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-4">Informations Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Titre de l&apos;annonce</label>
              <input 
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                type="text" 
                placeholder="Ex: Mercedes G63 AMG Edition 1" 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Prix (DZD)</label>
              <input 
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                type="number" 
                placeholder="Ex: 45000000" 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Marque</label>
              <select 
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
              >
                <option value="">Sélectionnez une marque</option>
                {CAR_BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Modèle</label>
              <input 
                name="model"
                value={form.model}
                onChange={handleChange}
                required
                type="text" 
                placeholder="Ex: Classe G" 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Wilaya</label>
              <select 
                name="wilaya"
                value={form.wilaya}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
              >
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-4">Spécifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Année</label>
              <input 
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                type="number" 
                placeholder="Ex: 2024" 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Kilométrage (km)</label>
              <input 
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
                required
                type="number" 
                placeholder="Ex: 15000" 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Carburant</label>
              <select 
                name="fuel"
                value={form.fuel}
                onChange={handleChange}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybride">Hybride</option>
                <option value="electrique">Électrique</option>
                <option value="gpl">GPL</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Boîte de vitesse</label>
              <select 
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="automatique">Automatique</option>
                <option value="manuelle">Manuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">État</label>
              <select 
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="neuf">Neuf</option>
                <option value="occasion">Excellent (Occasion)</option>
                <option value="accidente">Accidenté</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Couleur extérieure</label>
              <input 
                name="color"
                value={form.color}
                onChange={handleChange}
                type="text" 
                placeholder="Ex: Noir Obsidienne" 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C]" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Description</label>
            <textarea 
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5} 
              placeholder="Décrivez le véhicule, ses options et ses caractéristiques..." 
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] resize-none"
            ></textarea>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white/50 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#111] px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={18} />}
            {loading ? 'Publication...' : 'Soumettre l\'annonce'}
          </button>
        </div>

      </form>
    </div>
  );
}
