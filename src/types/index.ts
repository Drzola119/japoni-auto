export type Language = 'fr' | 'ar';

export interface CarListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: 'essence' | 'diesel' | 'electrique' | 'hybride' | 'gpl';
  transmission: 'manuelle' | 'automatique';
  condition: 'neuf' | 'occasion' | 'accidente';
  wilaya: string;
  description: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp?: string;
  isPremium: boolean;
  isVerified: boolean;
  isSold: boolean;
  viewCount: number;
  favoriteCount: number;
  category: 'voiture' | 'suv' | '4x4' | 'utilitaire' | 'camion' | 'moto';
  color: string;
  doors?: number;
  seats?: number;
  engineSize?: string;
  power?: string;
  importedFrom?: string;
  firstOwner?: boolean;
  warranty?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  whatsapp?: string;
  wilaya?: string;
  role: 'user' | 'seller' | 'admin';
  isPro: boolean;
  isVerified: boolean;
  totalListings: number;
  rating?: number;
  suspended: boolean;
  verifiedAt?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  verified?: boolean;
  createdAt: string;
}

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

export const WILAYAS = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna', '06 - Béjaïa', '07 - Biskra',
  '08 - Béchar', '09 - Blida', '10 - Bouïra', '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret',
  '15 - Tizi Ouzou', '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda', '21 - Skikda',
  '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine', '26 - Médéa', '27 - Mostaganem',
  "28 - M'Sila", '29 - Mascara', '30 - Ouargla', '31 - Oran', '32 - El Bayadh', '33 - Illizi',
  '34 - Bordj Bou Arréridj', '35 - Boumerdès', '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt',
  '39 - El Oued', '40 - Khenchela', '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma',
  '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - Timimoun', '50 - Bordj Badji Mokhtar',
  '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah', '54 - In Guezzam', '55 - Touggourt',
  '56 - Djanet', "57 - El M'Ghair", '58 - El Meniaâ', '59 - Aflou', '60 - Bir El Ater', '61 - El Kantara',
  '62 - Barika', '63 - El Aricha', '64 - Ksar Chellala', '65 - Aïn Oussera', '66 - Messaad',
  '67 - Ksar El Boukhari', '68 - Bou Saâda', '69 - El Abiodh Sidi Cheikh'
] as const;

export const CAR_BRANDS = [
  'Toyota', 'Hyundai', 'Volkswagen', 'Renault', 'Peugeot', 'Citroën',
  'Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Chevrolet', 'Kia', 'Nissan',
  'Honda', 'Mitsubishi', 'Suzuki', 'Dacia', 'Fiat', 'Opel', 'Seat',
  'Skoda', 'Volvo', 'Mazda', 'Subaru', 'Lexus', 'Jeep', 'Land Rover',
  'Range Rover', 'Tesla', 'BYD', 'Great Wall', 'Chery', 'JAC',
] as const;

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

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

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
