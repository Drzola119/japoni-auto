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
  role: 'user' | 'dealer' | 'admin';
  isPro: boolean;
  isVerified: boolean;
  totalListings: number;
  rating?: number;
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
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  'Msila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj',
  'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal',
  'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'ghair", 'El Meniaa'
] as const;

export const CAR_BRANDS = [
  'Toyota', 'Hyundai', 'Volkswagen', 'Renault', 'Peugeot', 'Citroën',
  'Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Chevrolet', 'Kia', 'Nissan',
  'Honda', 'Mitsubishi', 'Suzuki', 'Dacia', 'Fiat', 'Opel', 'Seat',
  'Skoda', 'Volvo', 'Mazda', 'Subaru', 'Lexus', 'Jeep', 'Land Rover',
  'Range Rover', 'Tesla', 'BYD', 'Great Wall', 'Chery', 'JAC',
] as const;
