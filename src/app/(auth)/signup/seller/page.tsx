'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WILAYAS } from '@/data/wilayas';
import toast from 'react-hot-toast';

export default function SellerSignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    wilaya: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = 'Le nom est requis';
    if (!form.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email invalide';
    if (!form.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    else if (!/^(\+213|0)[5-7][0-9]{8}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format: +213 XXX XXX XXX ou 0XXX XXX XXX';
    }
    if (!form.wilaya) newErrors.wilaya = 'Sélectionnez une wilaya';
    if (form.password.length < 8) newErrors.password = 'Minimum 8 caractères';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!form.agreeTerms) newErrors.agreeTerms = 'Vous devez accepter les conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, 'seller');
      
      const { db } = await import('@/lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      const { auth } = await import('@/lib/firebase');
      
      if (auth?.currentUser && db) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          phone: form.phone,
          wilaya: form.wilaya,
          dailyPostCount: 0,
          lastPostDate: '',
        });
      }
      
      toast.success('Compte vendeur créé avec succès !');
      router.push('/seller-dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (form.password.length === 0) return 0;
    if (form.password.length < 8) return 1;
    const hasUpper = /[A-Z]/.test(form.password);
    const hasLower = /[a-z]/.test(form.password);
    const hasNumber = /[0-9]/.test(form.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
    const types = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    return Math.min(types + 1, 4);
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort'];

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <Link href="/signup" className="flex items-center gap-2 text-[#A0A0A0] hover:text-white transition-colors w-fit">
          <ArrowLeft size={16} />
          Retour
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              Créer un compte <span className="text-[#2ECC71]">Vendeur</span>
            </h1>
            <p className="text-[#A0A0A0]">
              Publiez vos annonces et vendez vos véhicules
            </p>
          </div>

          {/* Daily Limit Info */}
          <div className="bg-[#2ECC71]/10 border border-[#2ECC71]/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-[#2ECC71]" size={20} />
              <div>
                <p className="text-sm font-medium text-[#2ECC71]">1 annonce gratuite par jour</p>
                <p className="text-xs text-[#A0A0A0]">Réinitialisation à minuit</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-2">Nom complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Votre nom complet"
                  className={`w-full bg-[#111111] border ${errors.name ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl pl-12 pr-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#2ECC71]`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="votre@email.com"
                  className={`w-full bg-[#111111] border ${errors.email ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl pl-12 pr-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#2ECC71]`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-2">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="+213 555 123 456"
                  className={`w-full bg-[#111111] border ${errors.phone ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl pl-12 pr-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#2ECC71]`}
                />
              </div>
              <p className="text-[#555] text-xs mt-1">Format: +213 XXX XXX XXX</p>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Wilaya */}
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-2">Wilaya</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                <select
                  value={form.wilaya}
                  onChange={handleChange('wilaya')}
                  className={`w-full bg-[#111111] border ${errors.wilaya ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#2ECC71] appearance-none`}
                >
                  <option value="">Sélectionnez une wilaya</option>
                  {WILAYAS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Minimum 8 caractères"
                  className={`w-full bg-[#111111] border ${errors.password ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl pl-12 pr-12 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#2ECC71]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`flex-1 rounded ${i < passwordStrength() ? strengthColors[passwordStrength()-1] : 'bg-[#2A2A2A]'}`} />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${strengthColors[passwordStrength()-1].replace('bg-', 'text-')}`}>
                    {strengthLabels[passwordStrength()-1]}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="Confirmez votre mot de passe"
                  className={`w-full bg-[#111111] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl pl-12 pr-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#2ECC71]`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={form.agreeTerms}
                onChange={(e) => setForm(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                className="mt-1 w-4 h-4 rounded bg-[#111111] border-[#2A2A2A] text-[#2ECC71] focus:ring-[#2ECC71]"
              />
              <label htmlFor="agreeTerms" className="text-sm text-[#A0A0A0]">
                J&apos;accepte les{' '}
                <Link href="/terms" className="text-[#2ECC71] hover:underline">conditions d&apos;utilisation</Link>
              </label>
            </div>
            {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#2ECC71] text-black font-bold rounded-xl hover:bg-[#27AE60] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Créer mon compte Vendeur
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[#A0A0A0] text-sm mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#2ECC71] hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}