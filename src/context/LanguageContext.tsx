'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.listings': 'Annonces',
    'nav.sell': 'Vendre',
    'nav.favorites': 'Favoris',
    'nav.login': 'Se connecter',
    'nav.register': "S'inscrire",
    'nav.profile': 'Profil',
    'nav.logout': 'Déconnexion',
    'nav.admin': 'Administration',
    // Hero
    'hero.title': 'Trouvez Votre Voiture',
    'hero.title.highlight': 'Idéale',
    'hero.subtitle': 'La plus grande plateforme de vente et d\'achat de voitures en Algérie. Des milliers d\'annonces vérifiées, des prix compétitifs.',
    'hero.search.placeholder': 'Marque, modèle, mot-clé...',
    'hero.btn.search': 'Rechercher',
    'hero.btn.sell': 'Vendre ma voiture',
    'hero.stats.listings': 'Annonces actives',
    'hero.stats.brands': 'Marques disponibles',
    'hero.stats.wilayas': 'Wilayas couvertes',
    // Listings
    'listings.title': 'Dernières Annonces',
    'listings.filter.all': 'Tout',
    'listings.filter.premium': 'Premium',
    'listings.filter.new': 'Neufs',
    'listings.filter.used': 'Occasions',
    'listings.btn.viewAll': 'Voir toutes les annonces',
    'listings.sort.recent': 'Plus récents',
    'listings.sort.priceAsc': 'Prix croissant',
    'listings.sort.priceDesc': 'Prix décroissant',
    'listings.filter.budget': 'Budget (DA)',
    'listings.filter.min': 'Min',
    'listings.filter.max': 'Max',
    // Car Details
    'car.year': 'Année',
    'car.mileage': 'Kilométrage',
    'car.fuel': 'Carburant',
    'car.transmission': 'Transmission',
    'car.wilaya': 'Wilaya',
    'car.price': 'Prix',
    'car.contact': 'Contacter le vendeur',
    'car.whatsapp': 'WhatsApp',
    'car.favorite': 'Ajouter aux favoris',
    'car.share': 'Partager',
    'car.views': 'vues',
    'car.verified': 'Vérifié',
    'car.premium': 'Premium',
    // Sell
    'sell.title': 'Publier une annonce',
    'sell.subtitle': 'Vendez votre voiture rapidement et facilement',
    'sell.btn.submit': 'Publier l\'annonce',
    'sell.form.brand': 'Marque',
    'sell.form.model': 'Modèle',
    'sell.form.year': 'Année',
    'sell.form.price': 'Prix (DA)',
    'sell.form.mileage': 'Kilométrage (km)',
    'sell.form.fuel': 'Carburant',
    'sell.form.transmission': 'Boîte de vitesse',
    'sell.form.condition': 'État',
    'sell.form.wilaya': 'Wilaya',
    'sell.form.description': 'Description',
    'sell.form.images': 'Photos',
    'sell.form.phone': 'Téléphone',
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.name': 'Nom complet',
    'auth.login.title': 'Se connecter',
    'auth.register.title': 'Créer un compte',
    'auth.forgot': 'Mot de passe oublié?',
    'auth.google': 'Continuer avec Google',
    // Fuel types
    'fuel.essence': 'Essence',
    'fuel.diesel': 'Diesel',
    'fuel.electrique': 'Électrique',
    'fuel.hybride': 'Hybride',
    'fuel.gpl': 'GPL',
    // Transmission
    'transmission.manuelle': 'Manuelle',
    'transmission.automatique': 'Automatique',
    // Condition
    'condition.neuf': 'Neuf',
    'condition.occasion': 'Occasion',
    'condition.accidente': 'Accidenté',
    // Common
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.reset': 'Réinitialiser',
    'common.loading': 'Chargement...',
    'common.noResults': 'Aucun résultat',
    'common.seeAll': 'Voir tout',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.confirm': 'Confirmer',
    'common.success': 'Succès',
    'common.error': 'Erreur',
    'common.close': 'Fermer',
    'common.km': 'km',
    'common.da': 'DA',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.listings': 'Listings',
    'nav.sell': 'Sell',
    'nav.favorites': 'Favorites',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin',
    // Hero
    'hero.title': 'Find Your Perfect',
    'hero.title.highlight': 'Car',
    'hero.subtitle': 'The largest car buying and selling platform in Algeria. Thousands of verified listings at competitive prices.',
    'hero.search.placeholder': 'Brand, model, keyword...',
    'hero.btn.search': 'Search',
    'hero.btn.sell': 'Sell my car',
    'hero.stats.listings': 'Active listings',
    'hero.stats.brands': 'Brands available',
    'hero.stats.wilayas': 'Wilayas covered',
    // Listings
    'listings.title': 'Latest Listings',
    'listings.filter.all': 'All',
    'listings.filter.premium': 'Premium',
    'listings.filter.new': 'New',
    'listings.filter.used': 'Used',
    'listings.btn.viewAll': 'View all listings',
    'listings.sort.recent': 'Most recent',
    'listings.sort.priceAsc': 'Price: Low to High',
    'listings.sort.priceDesc': 'Price: High to Low',
    'listings.filter.budget': 'Budget (DA)',
    'listings.filter.min': 'Min',
    'listings.filter.max': 'Max',
    // Car Details
    'car.year': 'Year',
    'car.mileage': 'Mileage',
    'car.fuel': 'Fuel',
    'car.transmission': 'Transmission',
    'car.wilaya': 'Wilaya',
    'car.price': 'Price',
    'car.contact': 'Contact seller',
    'car.whatsapp': 'WhatsApp',
    'car.favorite': 'Add to favorites',
    'car.share': 'Share',
    'car.views': 'views',
    'car.verified': 'Verified',
    'car.premium': 'Premium',
    // Sell
    'sell.title': 'Post an ad',
    'sell.subtitle': 'Sell your car quickly and easily',
    'sell.btn.submit': 'Post the ad',
    'sell.form.brand': 'Brand',
    'sell.form.model': 'Model',
    'sell.form.year': 'Year',
    'sell.form.price': 'Price (DA)',
    'sell.form.mileage': 'Mileage (km)',
    'sell.form.fuel': 'Fuel',
    'sell.form.transmission': 'Gearbox',
    'sell.form.condition': 'Condition',
    'sell.form.wilaya': 'Wilaya',
    'sell.form.description': 'Description',
    'sell.form.images': 'Photos',
    'sell.form.phone': 'Phone',
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full name',
    'auth.login.title': 'Login',
    'auth.register.title': 'Create account',
    'auth.forgot': 'Forgot password?',
    'auth.google': 'Continue with Google',
    // Fuel types
    'fuel.essence': 'Petrol',
    'fuel.diesel': 'Diesel',
    'fuel.electrique': 'Electric',
    'fuel.hybride': 'Hybrid',
    'fuel.gpl': 'LPG',
    // Transmission
    'transmission.manuelle': 'Manual',
    'transmission.automatique': 'Automatic',
    // Condition
    'condition.neuf': 'New',
    'condition.occasion': 'Used',
    'condition.accidente': 'Accidented',
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.reset': 'Reset',
    'common.loading': 'Loading...',
    'common.noResults': 'No results',
    'common.seeAll': 'See all',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.confirm': 'Confirm',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.close': 'Close',
    'common.km': 'km',
    'common.da': 'DA',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.listings': 'الإعلانات',
    'nav.sell': 'بيع',
    'nav.favorites': 'المفضلة',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.profile': 'الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',
    'nav.admin': 'الإدارة',
    // Hero
    'hero.title': 'ابحث عن سيارتك',
    'hero.title.highlight': 'المثالية',
    'hero.subtitle': 'أكبر منصة لبيع وشراء السيارات في الجزائر. آلاف الإعلانات الموثقة بأسعار تنافسية.',
    'hero.search.placeholder': 'الماركة، الموديل، كلمة مفتاحية...',
    'hero.btn.search': 'بحث',
    'hero.btn.sell': 'بيع سيارتي',
    'hero.stats.listings': 'إعلان نشط',
    'hero.stats.brands': 'ماركة متوفرة',
    'hero.stats.wilayas': 'ولاية مغطاة',
    // Listings
    'listings.title': 'أحدث الإعلانات',
    'listings.filter.all': 'الكل',
    'listings.filter.premium': 'مميز',
    'listings.filter.new': 'جديد',
    'listings.filter.used': 'مستعمل',
    'listings.btn.viewAll': 'عرض جميع الإعلانات',
    'listings.sort.recent': 'الأحدث',
    'listings.sort.priceAsc': 'السعر تصاعدي',
    'listings.sort.priceDesc': 'السعر تنازلي',
    'listings.filter.budget': 'الميزانية (دج)',
    'listings.filter.min': 'الأدنى',
    'listings.filter.max': 'الأقصى',
    // Car Details
    'car.year': 'السنة',
    'car.mileage': 'الأميال',
    'car.fuel': 'الوقود',
    'car.transmission': 'ناقل الحركة',
    'car.wilaya': 'الولاية',
    'car.price': 'السعر',
    'car.contact': 'تواصل مع البائع',
    'car.whatsapp': 'واتساب',
    'car.favorite': 'إضافة للمفضلة',
    'car.share': 'مشاركة',
    'car.views': 'مشاهدة',
    'car.verified': 'موثق',
    'car.premium': 'مميز',
    // Sell
    'sell.title': 'نشر إعلان',
    'sell.subtitle': 'بيع سيارتك بسرعة وسهولة',
    'sell.btn.submit': 'نشر الإعلان',
    'sell.form.brand': 'الماركة',
    'sell.form.model': 'الموديل',
    'sell.form.year': 'السنة',
    'sell.form.price': 'السعر (دج)',
    'sell.form.mileage': 'الأميال (كم)',
    'sell.form.fuel': 'نوع الوقود',
    'sell.form.transmission': 'ناقل الحركة',
    'sell.form.condition': 'الحالة',
    'sell.form.wilaya': 'الولاية',
    'sell.form.description': 'الوصف',
    'sell.form.images': 'الصور',
    'sell.form.phone': 'الهاتف',
    // Auth
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.name': 'الاسم الكامل',
    'auth.login.title': 'تسجيل الدخول',
    'auth.register.title': 'إنشاء حساب',
    'auth.forgot': 'نسيت كلمة المرور؟',
    'auth.google': 'المتابعة مع Google',
    // Fuel types
    'fuel.essence': 'بنزين',
    'fuel.diesel': 'ديزل',
    'fuel.electrique': 'كهربائي',
    'fuel.hybride': 'هجين',
    'fuel.gpl': 'غاز',
    // Transmission
    'transmission.manuelle': 'يدوي',
    'transmission.automatique': 'أوتوماتيك',
    // Condition
    'condition.neuf': 'جديد',
    'condition.occasion': 'مستعمل',
    'condition.accidente': 'حادث',
    // Common
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.reset': 'إعادة تعيين',
    'common.loading': 'جاري التحميل...',
    'common.noResults': 'لا توجد نتائج',
    'common.seeAll': 'عرض الكل',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.confirm': 'تأكيد',
    'common.success': 'نجح',
    'common.error': 'خطأ',
    'common.close': 'إغلاق',
    'common.km': 'كم',
    'common.da': 'دج',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      if (lang === 'ar') {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
