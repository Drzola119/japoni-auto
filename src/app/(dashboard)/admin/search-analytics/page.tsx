'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getTopSearches, getSearchCount, SearchTrendItem } from '@/lib/searchTracker';
import {
  Search, TrendingUp, TrendingDown, Minus,
  BarChart2, MapPin, Car, DollarSign,
  RefreshCw, Clock, Hash, Zap, Eye,
  ChevronUp, ChevronDown, Filter
} from 'lucide-react';
import { SearchAnalyticsPageSkeleton } from '@/components/admin/Skeletons';

const CATEGORY_CONFIG: Record<string, {
  label: string; color: string; bg: string; icon: React.ReactNode
}> = {
  make: { label: 'Marque', color: '#C9A84C', bg: 'bg-[#C9A84C]/10', icon: <Car size={11}/> },
  model: { label: 'Modèle', color: '#3498DB', bg: 'bg-[#3498DB]/10', icon: <Car size={11}/> },
  wilaya: { label: 'Wilaya', color: '#2ECC71', bg: 'bg-[#2ECC71]/10', icon: <MapPin size={11}/> },
  price_range: { label: 'Prix', color: '#9B59B6', bg: 'bg-[#9B59B6]/10', icon: <DollarSign size={11}/> },
  keyword: { label: 'Mot-clé', color: '#A0A0A0', bg: 'bg-[#A0A0A0]/10', icon: <Hash size={11}/> },
  combined: { label: 'Combinée', color: '#F39C12', bg: 'bg-[#F39C12]/10', icon: <Filter size={11}/> },
};

const DAYS_OPTIONS = [
  { value: 7, label: '7 jours' },
  { value: 14, label: '14 jours' },
  { value: 30, label: '30 jours' },
];

export default function SearchAnalyticsPage() {
  const [searches, setSearches] = useState<SearchTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const [results, count] = await Promise.all([
        getTopSearches({ limitCount: 30, days, category: filterCat === 'all' ? 'all' : filterCat as never }),
        getSearchCount(days),
      ]);
      setSearches(results);
      setTotalCount(count);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Search analytics load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [days, filterCat]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    searches.forEach(s => { map[s.category] = (map[s.category] || 0) + s.count; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [searches]);

  const maxCount = searches[0]?.count || 1;

  const topWilayas = useMemo(() =>
    searches.filter(s => s.category === 'wilaya' || s.term.includes('·')).slice(0, 5),
    [searches]
  );

  const topMakes = useMemo(() =>
    searches.filter(s => s.category === 'make').slice(0, 5),
    [searches]
  );

  if (loading) {
    return <SearchAnalyticsPageSkeleton />
  }

  return (
    <motion.div
      initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
      transition={{duration:0.35}} className="p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Search size={20} className="text-[#C9A84C]"/>
            Analytiques de Recherche
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">
            Ce que les acheteurs cherchent le plus sur Japoni Auto
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {DAYS_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                days === opt.value
                  ? 'bg-[#C9A84C] text-black'
                  : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C]/40'
              }`}>
              {opt.label}
            </button>
          ))}
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C]/40 transition-all">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''}/>
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: <Search size={18} className="text-[#C9A84C]"/>,
            val: totalCount,
            label: 'Recherches Totales',
            sub: `ces ${days} derniers jours`
          },
          {
            icon: <Hash size={18} className="text-[#C9A84C]"/>,
            val: searches.length,
            label: 'Termes Uniques',
            sub: 'expressions distinctes'
          },
          {
            icon: <TrendingUp size={18} className="text-[#2ECC71]"/>,
            val: searches.filter(s => s.trend === 'up').length,
            label: 'En Hausse',
            sub: 'vs période précédente'
          },
          {
            icon: <Zap size={18} className="text-[#C9A84C]"/>,
            val: searches[0]?.term || '—',
            label: 'Recherche #1',
            sub: `${searches[0]?.count || 0} fois cette semaine`,
            isText: true
          },
        ].map(({ icon, val, label, sub, isText }, i) => (
          <motion.div key={i}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            transition={{delay: i * 0.07}}
            className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 hover:border-[#C9A84C]/30 hover:shadow-[0_0_20px_rgba(201,168,76,0.07)] transition-all">
            <div className="rounded-xl bg-[#C9A84C]/10 p-2.5 w-fit mb-3">{icon}</div>
            <p className={`font-bold text-white mt-1 ${isText ? 'text-base truncate' : 'text-2xl'}`}>
              {val}
            </p>
            <p className="text-xs text-white font-medium mt-0.5">{label}</p>
            <p className="text-[10px] text-[#555] mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp size={15} className="text-[#C9A84C]"/>
              Top Recherches — {days} jours
            </h2>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="h-8 px-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-[#A0A0A0] focus:border-[#C9A84C]/50 focus:outline-none">
              <option value="all">Toutes catégories</option>
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({length: 8}).map((_,i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-6 h-4 bg-[#1A1A1A] rounded"/>
                  <div className="flex-1 h-8 bg-[#1A1A1A] rounded-lg"/>
                  <div className="w-12 h-4 bg-[#1A1A1A] rounded"/>
                </div>
              ))}
            </div>
          ) : searches.length === 0 ? (
            <div className="py-16 text-center">
              <Search size={32} className="text-[#333] mx-auto mb-3"/>
              <p className="text-white font-medium text-sm">Aucune recherche enregistrée</p>
              <p className="text-xs text-[#555] mt-1">
                Les données apparaîtront après les premières recherches utilisateurs.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-1.5">
              {searches.map((item, i) => {
                const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.keyword;
                const barWidth = Math.max((item.count / maxCount) * 100, 2);
                return (
                  <motion.div key={i}
                    initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}}
                    transition={{delay: i * 0.03}}
                    className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1A1A1A] transition-all cursor-default">
                    <span className="text-[11px] text-[#555] w-4 text-right flex-shrink-0 font-mono">
                      {i + 1}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${cfg.bg}`}
                      style={{color: cfg.color, borderColor: `${cfg.color}40`}}>
                      {cfg.icon}
                      <span className="hidden sm:inline">{cfg.label}</span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white truncate font-medium">
                          {item.term}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {item.trend === 'up' && (
                            <span className="flex items-center gap-0.5 text-[10px] text-[#2ECC71]">
                              <ChevronUp size={11}/> {item.trendPct}%
                            </span>
                          )}
                          {item.trend === 'down' && (
                            <span className="flex items-center gap-0.5 text-[10px] text-[#E74C3C]">
                              <ChevronDown size={11}/> {item.trendPct}%
                            </span>
                          )}
                          {item.trend === 'stable' && (
                            <Minus size={11} className="text-[#555]"/>
                          )}
                          <span className="text-xs font-bold text-white w-8 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                      <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <motion.div
                          initial={{width:0}}
                          animate={{width:`${barWidth}%`}}
                          transition={{delay: i * 0.03 + 0.2, duration: 0.5, ease:'easeOut'}}
                          className="h-full rounded-full"
                          style={{background: cfg.color}}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="px-5 py-2.5 border-t border-[#1E1E1E] flex items-center justify-between">
            <p className="text-[10px] text-[#555]">
              Dernière actualisation: {lastRefresh.toLocaleTimeString('fr-DZ')}
            </p>
            <p className="text-[10px] text-[#555]">
              {searches.length} termes · {totalCount} recherches
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 size={14} className="text-[#C9A84C]"/>
              Par Catégorie
            </h3>
            {byCategory.length === 0 ? (
              <p className="text-xs text-[#555] text-center py-4">Aucune donnée</p>
            ) : (
              <div className="space-y-2.5">
                {byCategory.map(([cat, count], i) => {
                  const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.keyword;
                  const max = byCategory[0]?.[1] || 1;
                  const pct = Math.round((count / max) * 100);
                  const totPct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium`}
                          style={{color: cfg.color}}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <span className="text-xs text-[#A0A0A0]">
                          {count} <span className="text-[#555]">({totPct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{width:`${pct}%`, background: cfg.color}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Car size={14} className="text-[#C9A84C]"/>
              Marques les Plus Cherchées
            </h3>
            {topMakes.length === 0 ? (
              <p className="text-xs text-[#555] text-center py-4">Aucune donnée marque</p>
            ) : (
              <div className="space-y-2">
                {topMakes.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i+1}
                      </span>
                      <span className="text-sm text-white">{item.term}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.trend === 'up' && <ChevronUp size={12} className="text-[#2ECC71]"/>}
                      {item.trend === 'down' && <ChevronDown size={12} className="text-[#E74C3C]"/>}
                      <span className="text-xs text-[#A0A0A0] font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-[#C9A84C]"/>
              Wilayas les Plus Recherchées
            </h3>
            {topWilayas.length === 0 ? (
              <p className="text-xs text-[#555] text-center py-4">Aucune donnée wilaya</p>
            ) : (
              <div className="space-y-2">
                {topWilayas.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2ECC71]/10 text-[#2ECC71] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i+1}
                      </span>
                      <span className="text-sm text-white">{item.term}</span>
                    </div>
                    <span className="text-xs text-[#A0A0A0] font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#C9A84C]/10 to-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-2xl p-5">
            <div className="flex items-start gap-2 mb-2">
              <Zap size={15} className="text-[#C9A84C] flex-shrink-0 mt-0.5"/>
              <p className="text-xs font-semibold text-[#C9A84C]">Insight Vendeurs</p>
            </div>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              {searches[0]
                ? `"${searches[0].term}" a été recherché ${searches[0].count} fois cette semaine. Encouragez vos vendeurs à publier plus d&apos;annonces dans cette catégorie.`
                : 'Les insights apparaîtront une fois les premières recherches enregistrées.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}