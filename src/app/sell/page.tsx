'use client';

import { useState } from 'react';
import Image from 'next/image';
import { m as motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { X, Plus, Car, Settings, Phone, ImagePlus, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { CAR_BRANDS, WILAYAS } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SellPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    brand: '', model: '', year: new Date().getFullYear().toString(), price: '',
    mileage: '', fuel: 'essence', transmission: 'manuelle', condition: 'occasion',
    wilaya: '', color: '', description: '', phone: '', whatsapp: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 6 - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!user) { toast.error('Connectez-vous pour publier'); router.push('/auth'); return; }
    if (!form.brand || !form.price || !form.wilaya) {
      toast.error('Remplissez tous les champs obligatoires');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success('Annonce publiée avec succès!');
    router.push('/listings');
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🔐</div>
          <h1 className="text-2xl font-bold text-white mb-3">Connexion requise</h1>
          <p className="text-slate-400 mb-6">Vous devez être connecté pour publier une annonce.</p>
          <Link href="/auth" className="btn-primary">Se connecter</Link>
        </div>
      </div>
    );
  }

  const steps = ['Véhicule', 'Détails', 'Photos & Contact'];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title mb-2">
            {t('sell.title').split(' ').slice(0, -1).join(' ')} <span>{t('sell.title').split(' ').slice(-1)}</span>
          </h1>
          <p className="text-slate-400">{t('sell.subtitle')}</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step - 1 && setStep(i + 1)}
                className="flex items-center gap-2 transition-all"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step === i + 1 ? 'text-white' : step > i + 1 ? 'text-white' : 'text-slate-500'}`}
                  style={{ background: step >= i + 1 ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.06)' }}>
                  {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-white' : 'text-slate-500'}`}>{s}</span>
              </button>
              {i < steps.length - 1 && (
                <div className="w-12 h-0.5 mx-1 rounded-full transition-all"
                     style={{ background: step > i + 1 ? '#f97316' : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-6 md:p-8"
          style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Step 1: Vehicle Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <Car className="w-5 h-5 text-orange-500" />
                <h2 className="text-white font-bold text-lg">Informations du véhicule</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.brand')} *</label>
                  <select value={form.brand} onChange={handleChange('brand')} className="select text-white">
                    <option value="" style={{ background: '#1a1a25' }}>Choisir une marque</option>
                    {CAR_BRANDS.map(b => <option key={b} value={b} style={{ background: '#1a1a25' }}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.model')} *</label>
                  <input value={form.model} onChange={handleChange('model')} placeholder="ex: Corolla, Tucson..." className="input text-white" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.year')} *</label>
                  <input type="number" value={form.year} onChange={handleChange('year')} min="1990" max="2025" className="input text-white" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Couleur</label>
                  <input value={form.color} onChange={handleChange('color')} placeholder="ex: Blanc, Noir..." className="input text-white" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.condition')} *</label>
                  <select value={form.condition} onChange={handleChange('condition')} className="select text-white">
                    <option value="neuf" style={{ background: '#1a1a25' }}>{t('condition.neuf')}</option>
                    <option value="occasion" style={{ background: '#1a1a25' }}>{t('condition.occasion')}</option>
                    <option value="accidente" style={{ background: '#1a1a25' }}>{t('condition.accidente')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.mileage')}</label>
                  <input type="number" value={form.mileage} onChange={handleChange('mileage')} placeholder="ex: 45000" className="input text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-orange-500" />
                <h2 className="text-white font-bold text-lg">Détails et prix</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.fuel')}</label>
                  <select value={form.fuel} onChange={handleChange('fuel')} className="select text-white">
                    {['essence', 'diesel', 'hybride', 'electrique', 'gpl'].map(f => (
                      <option key={f} value={f} style={{ background: '#1a1a25' }}>{t(`fuel.${f}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.transmission')}</label>
                  <select value={form.transmission} onChange={handleChange('transmission')} className="select text-white">
                    <option value="manuelle" style={{ background: '#1a1a25' }}>{t('transmission.manuelle')}</option>
                    <option value="automatique" style={{ background: '#1a1a25' }}>{t('transmission.automatique')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.wilaya')} *</label>
                  <select value={form.wilaya} onChange={handleChange('wilaya')} className="select text-white">
                    <option value="" style={{ background: '#1a1a25' }}>Choisir une wilaya</option>
                    {WILAYAS.map(w => <option key={w} value={w} style={{ background: '#1a1a25' }}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.price')} *</label>
                  <input type="number" value={form.price} onChange={handleChange('price')} placeholder="ex: 3500000" className="input text-white" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">{t('sell.form.description')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre véhicule en détail: état, équipements, historique..."
                  rows={4}
                  className="input text-white resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Photos & Contact */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <ImagePlus className="w-5 h-5 text-orange-500" />
                <h2 className="text-white font-bold text-lg">Photos & Contact</h2>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-slate-400 text-sm mb-3 block">{t('sell.form.images')} (max 6)</label>
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <Image src={img} alt="" fill className="object-cover" />
                      <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <label className="aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-orange-500/50"
                           style={{ border: '2px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}>
                      <Plus className="w-6 h-6 text-slate-500 mb-1" />
                      <span className="text-xs text-slate-500">Ajouter</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />
                    {t('sell.form.phone')} *
                  </label>
                  <input value={form.phone} onChange={handleChange('phone')} placeholder="ex: 0555 12 34 56" className="input text-white" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">WhatsApp</label>
                  <input value={form.whatsapp} onChange={handleChange('whatsapp')} placeholder="ex: +213 555 12 34 56" className="input text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary">← Précédent</button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary">Suivant →</button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Publication...' : t('sell.btn.submit')}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
