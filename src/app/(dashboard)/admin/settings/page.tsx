'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Settings, 
  Globe, 
  Bell, 
  Palette, 
  Save, 
  Mail, 
  Phone,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  X
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Japoni Auto',
    contactEmail: 'contact@japoniauto.store',
    contactPhone: '0555 00 00 00',
    requireApproval: true,
    maxPhotos: 8,
    notificationEmails: true,
    logoUrl: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadFile } = useFileUpload();

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db!, 'settings', 'general');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(prev => ({ ...prev, ...data }));
        if (data.logoUrl) setLogoPreview(data.logoUrl);
      }
    };
    fetchSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 2Mo)');
      return;
    }
    const result = await uploadFile(file, 'logo');
    if (result) {
      setSettings(prev => ({ ...prev, logoUrl: result.url }));
      setLogoPreview(result.url);
      toast.success('Logo téléchargé avec succès');
    }
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logoUrl: '' }));
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db!, 'settings', 'general'), settings);
      toast.success('Paramètres enregistrés avec succès');
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', icon: Globe, label: 'Général' },
    { id: 'listings', icon: Settings, label: 'Annonces' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'appearance', icon: Palette, label: 'Apparence' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-[#111111] p-8 rounded-2xl border border-[#2A2A2A] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-serif text-white font-bold flex items-center gap-3">
            <Settings className="text-[#C9A84C]" />
            Paramètres du Site
          </h1>
          <p className="text-[#555555] text-xs uppercase tracking-widest mt-2 font-bold">
            Configuration globale de la plateforme
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-[#C9A84C] text-[#07070C] rounded-xl font-bold text-sm hover:bg-[#E8C96A] transition-all shadow-[0_4px_20px_rgba(201,168,76,0.2)] disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : (
            <>
              <Save size={18} />
              Enregistrer
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#C9A84C] text-[#07070C] font-bold shadow-[0_4px_15px_rgba(201,168,76,0.2)]' 
                  : 'text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-sm uppercase tracking-widest font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8 shadow-xl"
            >
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-white font-serif text-lg font-bold border-b border-[#1E1E1E] pb-4 mb-8">Informations Générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-[#555555] uppercase font-bold tracking-widest ml-1">Nom du Site</label>
                      <input 
                        type="text" 
                        value={settings.siteName}
                        onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C]/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-[#555555] uppercase font-bold tracking-widest ml-1">Email de Contact</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2A2A2A]" size={16} />
                        <input 
                          type="email" 
                          value={settings.contactEmail}
                          onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#C9A84C]/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-[#555555] uppercase font-bold tracking-widest ml-1">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2A2A2A]" size={16} />
                        <input 
                          type="text" 
                          value={settings.contactPhone}
                          onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#C9A84C]/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'listings' && (
                <div className="space-y-8">
                  <h3 className="text-white font-serif text-lg font-bold border-b border-[#1E1E1E] pb-4 mb-8">Gestion des Annonces</h3>
                  <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A]">
                    <div>
                      <p className="text-sm text-white font-bold">Approbation Manuelle</p>
                      <p className="text-xs text-[#555555] mt-1">Nécessite la validation d&apos;un admin avant publication.</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, requireApproval: !settings.requireApproval})}
                      className={`w-12 h-6 rounded-full transition-all relative ${settings.requireApproval ? 'bg-[#C9A84C]' : 'bg-[#2A2A2A]'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.requireApproval ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#555555] uppercase font-bold tracking-widest ml-1">Maximum de Photos</label>
                    <input 
                      type="number" 
                      value={settings.maxPhotos}
                      onChange={(e) => setSettings({...settings, maxPhotos: parseInt(e.target.value)})}
                      className="w-full max-w-xs bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C]/50 outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-white font-serif text-lg font-bold border-b border-[#1E1E1E] pb-4 mb-8">Notifications Système</h3>
                  <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A]">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl"><Mail size={20} /></div>
                      <div>
                        <p className="text-sm text-white font-bold">Alertes Email</p>
                        <p className="text-xs text-[#555555] mt-1">Recevoir un email pour chaque nouvelle annonce.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, notificationEmails: !settings.notificationEmails})}
                      className={`w-12 h-6 rounded-full transition-all relative ${settings.notificationEmails ? 'bg-[#C9A84C]' : 'bg-[#2A2A2A]'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notificationEmails ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-8">
                  <h3 className="text-white font-serif text-lg font-bold border-b border-[#1E1E1E] pb-4 mb-8">Identité Visuelle</h3>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  
                  <div 
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`p-8 border-2 border-dashed rounded-3xl text-center group transition-all cursor-pointer ${
                      uploading ? 'border-[#C9A84C]/50 bg-[#C9A84C]/5' : 'border-[#2A2A2A] hover:border-[#C9A84C]/50'
                    }`}
                  >
                    {logoPreview ? (
                      <div className="relative inline-block">
                        <img src={logoPreview} alt="Logo" className="w-24 h-24 object-contain mx-auto rounded-xl" />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveLogo(); }}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#555555] group-hover:text-[#C9A84C] transition-all">
                        {uploading ? <Upload size={32} className="animate-pulse" /> : <ImageIcon size={32} />}
                      </div>
                    )}
                    <p className="text-sm text-white font-bold mt-4">
                      {uploading ? 'Téléchargement...' : logoPreview ? 'Changer le Logo' : 'Changer le Logo'}
                    </p>
                    <p className="text-xs text-[#555555] mt-2">Format PNG ou SVG recommandé. Taille max 2Mo.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] text-[#555555] uppercase font-bold tracking-widest ml-1">Thème Actuel</p>
                    <div className="flex items-center gap-4 p-4 bg-[#0D0D0D] rounded-2xl border border-[#C9A84C]/30 shadow-[0_0_15px_rgba(201,168,76,0.1)]">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#A07830]" />
                      <div className="flex-1">
                        <p className="text-sm text-white font-bold">Luxury Dark Gold</p>
                        <p className="text-xs text-[#555555]">Thème premium par défaut</p>
                      </div>
                      <CheckCircle2 size={20} className="text-[#C9A84C]" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
