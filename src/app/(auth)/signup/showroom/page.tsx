'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowRight, ArrowLeft, 
  CheckCircle, Upload, Building2, X, Loader2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { WILAYAS } from '@/data/wilayas';
import { useFileUpload } from '@/hooks/useFileUpload';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Informations personnelles' },
  { id: 2, title: 'Informations du showroom' },
  { id: 3, title: 'Documents officiels' },
];

export default function ShowroomSignupPage() {
  const router = useRouter();
  const { uploadSingle } = useFileUpload();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [form, setForm] = useState({
    ownerName: '',
    email: '',
    phone: '',
    wilaya: '',
    password: '',
    confirmPassword: '',
    showroomName: '',
    nif: '',
    registreCommerce: '',
    address: '',
    showroomWilaya: '',
    officialDocument: null as File | null,
    officialDocumentUrl: '',
    agreeTerms: false,
    agreeProfessional: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!form.ownerName.trim()) newErrors.ownerName = 'Le nom est requis';
      if (!form.email.trim()) newErrors.email = 'L\'email est requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email invalide';
      if (!form.phone.trim()) newErrors.phone = 'Le téléphone est requis';
      if (!form.wilaya) newErrors.wilaya = 'Sélectionnez une wilaya';
      if (form.password.length < 8) newErrors.password = 'Minimum 8 caractères';
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (step === 2) {
      if (!form.showroomName.trim()) newErrors.showroomName = 'Le nom du showroom est requis';
      if (!form.nif.trim()) newErrors.nif = 'Le NIF est requis';
      if (!form.registreCommerce.trim()) newErrors.registreCommerce = 'Le RC est requis';
      if (!form.address.trim()) newErrors.address = 'L\'adresse est requise';
      if (!form.showroomWilaya) newErrors.showroomWilaya = 'Sélectionnez une wilaya';
    }
    
    if (step === 3) {
      if (!form.officialDocumentUrl && !form.officialDocument) newErrors.officialDocument = 'Un document officiel est requis';
      if (!form.agreeTerms) newErrors.agreeTerms = 'Vous devez accepter les conditions';
      if (!form.agreeProfessional) newErrors.agreeProfessional = 'Vous devez accepter les conditions professionnelles';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier doit faire moins de 5Mo');
      return;
    }
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formats acceptés: PDF, JPG, PNG, WEBP');
      return;
    }

    setForm(prev => ({ ...prev, officialDocument: file }));
  };

  const uploadDocument = async (): Promise<string> => {
    if (!form.officialDocument) throw new Error('Aucun document');
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const result = await uploadSingle(form.officialDocument, `showroom_docs/${Date.now()}_${form.officialDocument.name}`);
      setUploadProgress(100);
      if (!result) {
        throw new Error('Échec du téléchargement du document');
      }
      return result.url;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    try {
      let documentUrl = form.officialDocumentUrl;
      
      if (form.officialDocument && !documentUrl) {
        documentUrl = await uploadDocument();
      }

      await addDoc(collection(db!, 'showroom_applications'), {
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        wilaya: form.wilaya,
        tempPassword: form.password,
        
        showroomName: form.showroomName,
        nif: form.nif,
        registreCommerce: form.registreCommerce,
        address: form.address,
        showroomWilaya: form.showroomWilaya,
        
        officialDocumentUrl: documentUrl,
        officialDocumentName: form.officialDocument?.name || '',
        
        status: 'pending',
        submittedAt: serverTimestamp(),
      });

      toast.success('Demande soumise avec succès !');
      router.push('/signup/showroom/pending');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la soumission');
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
    const types = [hasUpper, hasLower, hasNumber].filter(Boolean).length;
    return Math.min(types + 1, 4);
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <Link href="/signup" className="flex items-center gap-2 text-[#A0A0A0] hover:text-white transition-colors w-fit">
          <ArrowLeft size={16} />
          Retour
        </Link>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-[#C9A84C]' : 'text-[#555]'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep > step.id 
                    ? 'bg-[#C9A84C] text-black' 
                    : currentStep === step.id 
                    ? 'bg-[#C9A84C]/20 border-2 border-[#C9A84C] text-[#C9A84C]'
                    : 'bg-[#1A1A1A] border border-[#2A2A2A]'
                }`}>
                  {currentStep > step.id ? <CheckCircle size={16} /> : step.id}
                </div>
                <span className="text-sm hidden sm:inline">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${currentStep > step.id ? 'bg-[#C9A84C]' : 'bg-[#2A2A2A]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-lg w-full"
        >
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  Informations <span className="text-[#C9A84C]">personnelles</span>
                </h1>
                <p className="text-[#A0A0A0]">Coordonnées du responsable du showroom</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Nom complet du responsable</label>
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={handleChange('ownerName')}
                    placeholder="Prénom et nom"
                    className={`w-full bg-[#111111] border ${errors.ownerName ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                  {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Email professionnel</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="email@showroom.dz"
                    className={`w-full bg-[#111111] border ${errors.email ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="+213 555 123 456"
                    className={`w-full bg-[#111111] border ${errors.phone ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Wilaya de résidence</label>
                  <select
                    value={form.wilaya}
                    onChange={handleChange('wilaya')}
                    className={`w-full bg-[#111111] border ${errors.wilaya ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] appearance-none`}
                  >
                    <option value="">Sélectionnez</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Mot de passe temporaire</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange('password')}
                      placeholder="Sera utilisé pour créer le compte après approbation"
                      className={`w-full bg-[#111111] border ${errors.password ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 pr-12 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Confirmer le mot de passe</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    placeholder="Confirmez"
                    className={`w-full bg-[#111111] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Showroom Info */}
          {currentStep === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  Informations du <span className="text-[#C9A84C]">showroom</span>
                </h1>
                <p className="text-[#A0A0A0]">Détails de votre établissement</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Nom du showroom</label>
                  <input
                    type="text"
                    value={form.showroomName}
                    onChange={handleChange('showroomName')}
                    placeholder="ex. Auto Showroom Alger"
                    className={`w-full bg-[#111111] border ${errors.showroomName ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                  {errors.showroomName && <p className="text-red-500 text-xs mt-1">{errors.showroomName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#A0A0A0] mb-2">NIF</label>
                    <input
                      type="text"
                      value={form.nif}
                      onChange={handleChange('nif')}
                      placeholder="Numéro d&apos;identification"
                      className={`w-full bg-[#111111] border ${errors.nif ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                    />
                    {errors.nif && <p className="text-red-500 text-xs mt-1">{errors.nif}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-[#A0A0A0] mb-2">Registre de Commerce</label>
                    <input
                      type="text"
                      value={form.registreCommerce}
                      onChange={handleChange('registreCommerce')}
                      placeholder="RC N°"
                      className={`w-full bg-[#111111] border ${errors.registreCommerce ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                    />
                    {errors.registreCommerce && <p className="text-red-500 text-xs mt-1">{errors.registreCommerce}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Adresse complète du showroom</label>
                  <textarea
                    value={form.address}
                    onChange={handleChange('address')}
                    placeholder="Adresse complète incluant la wilaya"
                    rows={3}
                    className={`w-full bg-[#111111] border ${errors.address ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C] resize-none`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Wilaya du showroom</label>
                  <select
                    value={form.showroomWilaya}
                    onChange={handleChange('showroomWilaya')}
                    className={`w-full bg-[#111111] border ${errors.showroomWilaya ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] appearance-none`}
                  >
                    <option value="">Sélectionnez</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  {errors.showroomWilaya && <p className="text-red-500 text-xs mt-1">{errors.showroomWilaya}</p>}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  Documents <span className="text-[#C9A84C]">officiels</span>
                </h1>
                <p className="text-[#A0A0A0]">Téléchargez votre document officiel (RC ou NIF)</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Document officiel</label>
                  <div className={`border-2 border-dashed ${errors.officialDocument ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl p-6 text-center hover:border-[#C9A84C] transition-colors`}>
                    {form.officialDocument || form.officialDocumentUrl ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle className="text-[#2ECC71]" size={24} />
                        <span className="text-white">{form.officialDocument?.name || 'Document téléchargé'}</span>
                        <button onClick={() => setForm(prev => ({ ...prev, officialDocument: null, officialDocumentUrl: '' }))} className="text-red-500 hover:text-red-400">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="mx-auto text-[#C9A84C] mb-2" size={32} />
                        <p className="text-[#A0A0A0] mb-1">Cliquez pour télécharger ou glissez-déposez</p>
                        <p className="text-[#555] text-xs">PDF, JPG, PNG, WEBP - Max 5Mo</p>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleDocumentUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  {uploading && (
                    <div className="mt-2">
                      <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A84C] transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                  {errors.officialDocument && <p className="text-red-500 text-xs mt-1">{errors.officialDocument}</p>}
                </div>

                <div className="space-y-3 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={(e) => setForm(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                      className="mt-1 w-4 h-4 rounded bg-[#111111] border-[#2A2A2A] text-[#C9A84C]"
                    />
                    <span className="text-sm text-[#A0A0A0]">
                      Je certifie que les informations fournies sont exactes
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreeProfessional}
                      onChange={(e) => setForm(prev => ({ ...prev, agreeProfessional: e.target.checked }))}
                      className="mt-1 w-4 h-4 rounded bg-[#111111] border-[#2A2A2A] text-[#C9A84C]"
                    />
                    <span className="text-sm text-[#A0A0A0]">
                      J&apos;accepte les{' '}
                      <Link href="/terms" className="text-[#C9A84C] hover:underline">conditions d&apos;utilisation</Link>{' '}
                      et conditions professionnelles
                    </span>
                  </label>
                  {errors.agreeProfessional && <p className="text-red-500 text-xs">{errors.agreeProfessional}</p>}
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#111111] border border-[#2A2A2A] text-white rounded-xl hover:border-[#555] transition-colors"
              >
                <ArrowLeft size={18} />
                Précédent
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#C9A84C] text-black font-bold rounded-xl hover:bg-[#E8C96A] transition-colors"
              >
                Suivant
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || uploading}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#C9A84C] text-black font-bold rounded-xl hover:bg-[#E8C96A] transition-colors disabled:opacity-50"
              >
                {loading || uploading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Soumettre ma demande
                    <CheckCircle size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}