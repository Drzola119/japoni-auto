// Core Role Types
export type UserRole = 'buyer' | 'seller' | 'showroom' | 'admin';
export type UserStatus = 'active' | 'pending' | 'rejected' | 'suspended';
export type ShowroomTier = 'bronze' | 'silver' | 'gold';
export type VideoPlatform = 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'dailymotion';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'sold';
export type FuelType = 'essence' | 'diesel' | 'electrique' | 'hybride' | 'gpl';
export type TransmissionType = 'manuelle' | 'automatique';
export type ConditionType = 'neuf' | 'occasion' | 'accidente';
export type CategoryType = 'voiture' | 'suv' | '4x4' | 'utilitaire' | 'camion' | 'moto';

// User Document Interface
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  whatsapp?: string;
  wilaya?: string;
  role: UserRole;
  status: UserStatus;
  suspended?: boolean;
  createdAt: string;
  
  // Seller-specific
  dailyPostCount?: number;
  lastPostDate?: string;
  
  // Showroom-specific
  showroomTier?: ShowroomTier;
  showroomName?: string;
  showroomApplicationId?: string;
  showroomAddress?: string;
  showroomWilaya?: string;
  isVerified?: boolean;
  
  // Legacy fields (for backwards compatibility)
  isPro?: boolean;
  totalListings?: number;
  rating?: number;
  verified?: boolean;
}

// Showroom Application Interface
export interface ShowroomApplication {
  id: string;
  
  // User reference (set after creation)
  userId?: string;
  
  // Owner info
  ownerName: string;
  email: string;
  phone: string;
  wilaya: string;
  tempPassword?: string;
  
  // Business info
  showroomName: string;
  nif: string;
  registreCommerce: string;
  address: string;
  showroomWilaya: string;
  
  // Documents
  documents?: {
    registreCommerce?: string;
    nif?: string;
    officialDocument?: string;
  };
  
  // Workflow
  status: ApplicationStatus;
  tier?: ShowroomTier;
  adminNote?: string;
  
  // Timestamps
  createdAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Video Link Interface
export interface VideoLink {
  url: string;
  platform: VideoPlatform;
  embedId: string;
  thumbnailUrl?: string;
}

// Car Listing Interface
export interface CarListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: FuelType;
  transmission: TransmissionType;
  condition: ConditionType;
  wilaya: string;
  description: string;
  images: string[];
  mainImage?: string;
  videoUrl?: string;
  videoUrlRaw?: string;
  
  sellerId?: string;
  sellerRole?: 'seller' | 'showroom';
  sellerName?: string;
  sellerWilaya?: string;
  sellerPhone?: string;
  sellerWhatsapp?: string;
  
  isPremium?: boolean;
  isVerified?: boolean;
  isSold?: boolean;
  isExpired?: boolean;
  viewCount?: number;
  favoriteCount?: number;
  
category?: CategoryType;
  color?: string;
  doors?: number;
  seats?: number;
  engineSize?: string;
  power?: string;
  importedFrom?: string;
  firstOwner?: boolean;
  warranty?: boolean;
  
  expiresAt?: string;
  postedDate?: string;
  
  status?: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

// Filter State Interface
export interface FilterState {
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuel?: string;
  transmission?: string;
  condition?: string;
  wilaya?: string;
  category?: string;
  sortBy: 'recent' | 'price-asc' | 'price-desc' | 'mileage' | 'year';
}

// Inquiry Interface
export interface Inquiry {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// Report Interface
export interface Report {
  id: string;
  targetType: 'listing' | 'user';
  targetId: string;
  reason: string;
  details: string;
  reportedBy: string;
  reporterName?: string;
  status: 'open' | 'reviewed' | 'resolved';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Audit Log Interface
export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  type: string;
  message: string;
  userEmail?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Favorite Interface
export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

// Language type (for i18n)
export type Language = 'fr' | 'ar';

// Tier Pricing (DA per month)
export const SHOWROOM_PRICING = {
  bronze: 2900,
  silver: 5900,
  gold: 9900,
} as const;

export const DAILY_LIMITS = {
  buyer: 0,
  seller: 1,
  showroom: {
    bronze: 20,
    silver: 50,
    gold: Infinity,
  },
} as const;

export const IMAGE_LIMITS = {
  seller: 1,
  showroom: 4,
} as const;

export const EXPIRY_DAYS = {
  seller: 30,
  showroom: 60,
  gold: 9999,
} as const;

// WILAYAS - Clean list without numbers for dropdowns
export const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna',
  'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouïra',
  'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou',
  'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
  'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine',
  'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla',
  'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
  'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma',
  'Aïn Témouchent', 'Ghardaïa', 'Relizane',
  'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès', 'In Salah',
  'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa',
  'Aflou', 'Barika', 'Ksar Chellala', 'Messaad', 'Aïn Oussera',
  'Bou Saâda', 'El Abiodh Sidi Cheikh', 'El Kantara', 'Bir El Ater',
  'Ksar El Boukhari', 'El Aricha'
] as const;

// CAR BRANDS
export const CAR_BRANDS = [
  'Toyota', 'Hyundai', 'Volkswagen', 'Renault', 'Peugeot', 'Citroën',
  'Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Chevrolet', 'Kia', 'Nissan',
  'Honda', 'Mitsubishi', 'Suzuki', 'Dacia', 'Fiat', 'Opel', 'Seat',
  'Skoda', 'Volvo', 'Mazda', 'Subaru', 'Lexus', 'Jeep', 'Land Rover',
  'Range Rover', 'Tesla', 'BYD', 'Great Wall', 'Chery', 'JAC',
  'Porsche', 'Lamborghini', 'Ferrari', 'Maserati', 'Rolls Royce', 'Bentley',
  'McLaren', 'Aston Martin', 'Bugatti', 'Jaguar', 'Alfa Romeo', 'Dodge'
] as const;

// Export all as const for type safety
export type WILAYA = typeof WILAYAS[number];
export type CAR_BRAND = typeof CAR_BRANDS[number];