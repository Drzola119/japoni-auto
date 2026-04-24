'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowRight, ArrowLeft, 
  CheckCircle, Upload, FileText, Building2, X, Loader2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { WILAYAS } from '@/data/wilayas';
import { useFileUpload } from '@/hooks/useFileUpload';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Personal Information' },
  { id: 2, title: 'Showroom Information' },
  { id: 3, title: 'Official Documents' },
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
    // Step 1
    ownerName: '',
    email: '',
    phone: '',
    wilaya: '',
    password: '',
    confirmPassword: '',
    // Step 2
    showroomName: '',
    nif: '',
    registreCommerce: '',
    address: '',
    showroomWilaya: '',
    // Step 3
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
      if (!form.ownerName.trim()) newErrors.ownerName = 'Name is required';
      if (!form.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
      if (!form.phone.trim()) newErrors.phone = 'Phone is required';
      if (!form.wilaya) newErrors.wilaya = 'Select a wilaya';
      if (form.password.length < 8) newErrors.password = 'Minimum 8 characters';
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (step === 2) {
      if (!form.showroomName.trim()) newErrors.showroomName = 'Showroom name is required';
      if (!form.nif.trim()) newErrors.nif = 'NIF is required';
      if (!form.registreCommerce.trim()) newErrors.registreCommerce = 'RC is required';
      if (!form.address.trim()) newErrors.address = 'Address is required';
      if (!form.showroomWilaya) newErrors.showroomWilaya = 'Select a wilaya';
    }
    
    if (step === 3) {
      if (!form.officialDocumentUrl && !form.officialDocument) newErrors.officialDocument = 'Official document is required';
      if (!form.agreeTerms) newErrors.agreeTerms = 'You must accept the terms';
      if (!form.agreeProfessional) newErrors.agreeProfessional = 'You must accept the professional terms';
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
      toast.error('File must be less than 5MB');
      return;
    }
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Accepted formats: PDF, JPG, PNG, WEBP');
      return;
    }

    setForm(prev => ({ ...prev, officialDocument: file }));
  };

  const uploadDocument = async (): Promise<string> => {
    if (!form.officialDocument) throw new Error('No document');
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const result = await uploadSingle(form.officialDocument, `showroom_docs/${Date.now()}_${form.officialDocument.name}`);
      setUploadProgress(100);
      if (!result) {
        throw new Error('Document upload failed');
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

      // Create showroom application (NOT a user yet)
      await addDoc(collection(db!, 'showroom_applications'), {
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        wilaya: form.wilaya,
        tempPassword: form.password, // Will be used to create auth user after approval
        
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

      toast.success('Application submitted successfully!');
      router.push('/signup/showroom/pending');
    } catch (err: any) {
      toast.error(err.message || 'Error submitting application');
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
          Back
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
                  Personal <span className="text-[#C9A84C]">Information</span>
                </h1>
                <p className="text-[#A0A0A0]">Contact details for the showroom owner</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Owner's Full Name</label>
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={handleChange('ownerName')}
                    placeholder="First and last name"
                    className={`w-full bg-[#111111] border ${errors.ownerName ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Professional Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="email@showroom.dz"
                    className={`w-full bg-[#111111] border ${errors.email ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="+213 555 123 456"
                    className={`w-full bg-[#111111] border ${errors.phone ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Residence Wilaya</label>
                  <select
                    value={form.wilaya}
                    onChange={handleChange('wilaya')}
                    className={`w-full bg-[#111111] border ${errors.wilaya ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] appearance-none`}
                  >
                    <option value="">Select</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Temporary Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange('password')}
                    placeholder="Will be used to create account after approval"
                    className={`w-full bg-[#111111] border ${errors.password ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    placeholder="Confirm"
                    className={`w-full bg-[#111111] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Showroom Info */}
          {currentStep === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  Showroom <span className="text-[#C9A84C]">Information</span>
                </h1>
                <p className="text-[#A0A0A0]">Details about your establishment</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Showroom Name</label>
                  <input
                    type="text"
                    value={form.showroomName}
                    onChange={handleChange('showroomName')}
                    placeholder="e.g. Auto Showroom Algiers"
                    className={`w-full bg-[#111111] border ${errors.showroomName ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#A0A0A0] mb-2">NIF (Tax ID)</label>
                    <input
                      type="text"
                      value={form.nif}
                      onChange={handleChange('nif')}
                      placeholder="Identification number"
                      className={`w-full bg-[#111111] border ${errors.nif ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#A0A0A0] mb-2">Business Register (RC)</label>
                    <input
                      type="text"
                      value={form.registreCommerce}
                      onChange={handleChange('registreCommerce')}
                      placeholder="RC N°"
                      className={`w-full bg-[#111111] border ${errors.registreCommerce ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Full Showroom Address</label>
                  <textarea
                    value={form.address}
                    onChange={handleChange('address')}
                    placeholder="Full address including wilaya"
                    rows={3}
                    className={`w-full bg-[#111111] border ${errors.address ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C] resize-none`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Showroom Wilaya</label>
                  <select
                    value={form.showroomWilaya}
                    onChange={handleChange('showroomWilaya')}
                    className={`w-full bg-[#111111] border ${errors.showroomWilaya ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] appearance-none`}
                  >
                    <option value="">Select</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  Official <span className="text-[#C9A84C]">Documents</span>
                </h1>
                <p className="text-[#A0A0A0]">Upload your official document (RC or NIF)</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Official Document</label>
                  <div className={`border-2 border-dashed ${errors.officialDocument ? 'border-red-500' : 'border-[#2A2A2A]'} rounded-xl p-6 text-center hover:border-[#C9A84C] transition-colors`}>
                    {form.officialDocument || form.officialDocumentUrl ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle className="text-[#2ECC71]" size={24} />
                        <span className="text-white">{form.officialDocument?.name || 'Document uploaded'}</span>
                        <button onClick={() => setForm(prev => ({ ...prev, officialDocument: null, officialDocumentUrl: '' }))} className="text-red-500 hover:text-red-400">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="mx-auto text-[#C9A84C] mb-2" size={32} />
                        <p className="text-[#A0A0A0] mb-1">Click to upload or drag and drop</p>
                        <p className="text-[#555] text-xs">PDF, JPG, PNG, WEBP - Max 5MB</p>
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
                      I certify that the information provided is accurate
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreeProfessional}
                      onChange={(e) => setForm(prev => ({ ...prev, agreeProfessional: e.target.checked }))}
                      className="mt-1 w-4 h-4 rounded bg-[#111111] border-[#2A2A2A] text-[#C9A84C]"
                    />
                    <span className="text-sm text-[#A0A0A0]">
                      I accept the{' '}
                      <Link href="/terms" className="text-[#C9A84C] hover:underline">terms of use</Link>{' '}
                      and professional conditions
                    </span>
                  </label>
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
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#C9A84C] text-black font-bold rounded-xl hover:bg-[#E8C96A] transition-colors"
              >
                Next
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
                    Submit Application
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