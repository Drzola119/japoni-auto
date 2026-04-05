'use client';

import { useState } from 'react';
import { Search, Grid3X3, List } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import CarCard from '@/components/CarCard';
import { CarListing, CAR_BRANDS, WILAYAS } from '@/types';
import { cn } from '@/lib/utils';

const DEMO_CARS: CarListing[] = [
  {
    id: '1', title: 'Toyota Corolla Cross 2023 Full Options', brand: 'Toyota', model: 'Corolla Cross',
    year: 2023, price: 7500000, mileage: 12000, fuel: 'hybride', transmission: 'automatique',
    condition: 'neuf', wilaya: 'Alger', description: '',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80'],
    sellerId: '1', sellerName: 'Karim D.', sellerPhone: '0555123456',
    isPremium: true, isVerified: true, isSold: false, viewCount: 342, favoriteCount: 45,
    category: 'voiture', color: 'Blanc', createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
  {
    id: '2', title: 'Hyundai Tucson 2022 1.6 T-GDI', brand: 'Hyundai', model: 'Tucson',
    year: 2022, price: 5800000, mileage: 35000, fuel: 'essence', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Oran', description: '',
    images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80'],
    sellerId: '2', sellerName: 'Ahmed B.', sellerPhone: '0555234567',
    isPremium: false, isVerified: true, isSold: false, viewCount: 198, favoriteCount: 22,
    category: 'suv', color: 'Gris', createdAt: '2025-01-02', updatedAt: '2025-01-02',
  },
  {
    id: '3', title: 'Mercedes-Benz C 220 AMG Line 2021', brand: 'Mercedes-Benz', model: 'Classe C',
    year: 2021, price: 9200000, mileage: 55000, fuel: 'diesel', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Constantine', description: '',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'],
    sellerId: '3', sellerName: 'Salim M.', sellerPhone: '0555345678',
    isPremium: true, isVerified: false, isSold: false, viewCount: 511, favoriteCount: 78,
    category: 'voiture', color: 'Noir', createdAt: '2025-01-03', updatedAt: '2025-01-03',
  },
  {
    id: '4', title: 'Volkswagen Tiguan 2023 R-Line', brand: 'Volkswagen', model: 'Tiguan',
    year: 2023, price: 8400000, mileage: 8000, fuel: 'essence', transmission: 'automatique',
    condition: 'neuf', wilaya: 'Sétif', description: '',
    images: ['https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=80'],
    sellerId: '4', sellerName: 'Yacine K.', sellerPhone: '0555456789',
    isPremium: false, isVerified: true, isSold: false, viewCount: 124, favoriteCount: 16,
    category: 'suv', color: 'Bleu', createdAt: '2025-01-04', updatedAt: '2025-01-04',
  },
  {
    id: '5', title: 'BMW Série 3 320i 2020', brand: 'BMW', model: 'Série 3',
    year: 2020, price: 7800000, mileage: 68000, fuel: 'essence', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Blida', description: '',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'],
    sellerId: '5', sellerName: 'Rachid A.', sellerPhone: '0555567890',
    isPremium: true, isVerified: true, isSold: false, viewCount: 287, favoriteCount: 41,
    category: 'voiture', color: 'Gris', createdAt: '2025-01-05', updatedAt: '2025-01-05',
  },
  {
    id: '6', title: 'Renault Duster 2022 4x4', brand: 'Renault', model: 'Duster',
    year: 2022, price: 3600000, mileage: 42000, fuel: 'diesel', transmission: 'manuelle',
    condition: 'occasion', wilaya: 'Annaba', description: '',
    images: ['https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=800&q=80'],
    sellerId: '6', sellerName: 'Hassan L.', sellerPhone: '0555678901',
    isPremium: false, isVerified: false, isSold: false, viewCount: 93, favoriteCount: 11,
    category: '4x4', color: 'Rouge', createdAt: '2025-01-06', updatedAt: '2025-01-06',
  },
  {
    id: '7', title: 'Kia Sportage 2023 GT-Line', brand: 'Kia', model: 'Sportage',
    year: 2023, price: 6200000, mileage: 22000, fuel: 'hybride', transmission: 'automatique',
    condition: 'neuf', wilaya: 'Tizi Ouzou', description: '',
    images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80'],
    sellerId: '7', sellerName: 'Meziane A.', sellerPhone: '0555789012',
    isPremium: true, isVerified: true, isSold: false, viewCount: 445, favoriteCount: 63,
    category: 'suv', color: 'Vert', createdAt: '2025-01-07', updatedAt: '2025-01-07',
  },
  {
    id: '8', title: 'Peugeot 3008 2021 Hybrid', brand: 'Peugeot', model: '3008',
    year: 2021, price: 5100000, mileage: 48000, fuel: 'hybride', transmission: 'automatique',
    condition: 'occasion', wilaya: 'Béjaïa', description: '',
    images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'],
    sellerId: '8', sellerName: 'Tariq B.', sellerPhone: '0555890123',
    isPremium: false, isVerified: true, isSold: false, viewCount: 176, favoriteCount: 29,
    category: 'suv', color: 'Blanc', createdAt: '2025-01-08', updatedAt: '2025-01-08',
  },
];

export default function ListingsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = DEMO_CARS
    .filter(car => {
      const q = searchQuery.toLowerCase();
      if (q && !car.title.toLowerCase().includes(q) && !car.brand.toLowerCase().includes(q)) return false;
      if (selectedBrand && car.brand !== selectedBrand) return false;
      if (selectedWilaya && car.wilaya !== selectedWilaya) return false;
      if (selectedFuel && car.fuel !== selectedFuel) return false;
      if (selectedCondition && car.condition !== selectedCondition) return false;
      if (priceMin && car.price < parseInt(priceMin)) return false;
      if (priceMax && car.price > parseInt(priceMax)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const resetFilters = () => {
    setSelectedBrand('');
    setSelectedWilaya('');
    setSelectedFuel('');
    setSelectedCondition('');
    setPriceMin('');
    setPriceMax('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-2">
            Toutes les <span>Annonces</span>
          </h1>
          <p className="text-slate-400">{filtered.length} annonces trouvées</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filter */}
          <aside className={cn(
            'w-72 flex-shrink-0 hidden lg:block'
          )}>
            <div className="sticky top-28 rounded-2xl p-6" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-base">Filtres</h2>
                <button onClick={resetFilters} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  Réinitialiser
                </button>
              </div>

              {/* Brand */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">Marque</label>
                <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="select text-white text-sm">
                  <option value="" style={{ background: '#1a1a25' }}>Toutes les marques</option>
                  {CAR_BRANDS.map(b => <option key={b} value={b} style={{ background: '#1a1a25' }}>{b}</option>)}
                </select>
              </div>

              {/* Wilaya */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">Wilaya</label>
                <select value={selectedWilaya} onChange={e => setSelectedWilaya(e.target.value)} className="select text-white text-sm">
                  <option value="" style={{ background: '#1a1a25' }}>Toutes</option>
                  {WILAYAS.map(w => <option key={w} value={w} style={{ background: '#1a1a25' }}>{w}</option>)}
                </select>
              </div>

              {/* Fuel */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">Carburant</label>
                <select value={selectedFuel} onChange={e => setSelectedFuel(e.target.value)} className="select text-white text-sm">
                  <option value="" style={{ background: '#1a1a25' }}>Tous</option>
                  {['essence', 'diesel', 'hybride', 'electrique', 'gpl'].map(f => (
                    <option key={f} value={f} style={{ background: '#1a1a25' }}>{t(`fuel.${f}`)}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">État</label>
                <select value={selectedCondition} onChange={e => setSelectedCondition(e.target.value)} className="select text-white text-sm">
                  <option value="" style={{ background: '#1a1a25' }}>Tous</option>
                  {['neuf', 'occasion', 'accidente'].map(c => (
                    <option key={c} value={c} style={{ background: '#1a1a25' }}>{t(`condition.${c}`)}</option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">{t('listings.filter.budget')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={t('listings.filter.min')}
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    className="input text-white text-sm"
                  />
                  <input
                    type="number"
                    placeholder={t('listings.filter.max')}
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    className="input text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Search + Sort Bar */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex-1 relative min-w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input pl-10 text-white text-sm"
                />
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="select w-44 text-white text-sm"
              >
                <option value="recent" style={{ background: '#1a1a25' }}>{t('listings.sort.recent')}</option>
                <option value="price-asc" style={{ background: '#1a1a25' }}>{t('listings.sort.priceAsc')}</option>
                <option value="price-desc" style={{ background: '#1a1a25' }}>{t('listings.sort.priceDesc')}</option>
              </select>
              <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'text-white' : 'text-slate-500')} style={viewMode === 'grid' ? { background: 'rgba(249,115,22,0.15)' } : {}}>
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'text-white' : 'text-slate-500')} style={viewMode === 'list' ? { background: 'rgba(249,115,22,0.15)' } : {}}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cars Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🚗</div>
                <p className="text-slate-400 text-lg">{t('common.noResults')}</p>
                <button onClick={resetFilters} className="btn-primary mt-4">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              )}>
                {filtered.map((car, i) => (
                  <CarCard key={car.id} car={car} index={i} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
