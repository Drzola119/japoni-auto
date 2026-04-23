'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getTopSearches, SearchTrendItem } from '@/lib/searchTracker';
import {
  Search, TrendingUp, ChevronUp,
  ChevronDown, Minus, ArrowRight, Zap
} from 'lucide-react';
import { Shimmer } from '@/components/admin/Skeletons';

const CAT_COLORS: Record<string, string> = {
  make: '#C9A84C',
  model: '#3498DB',
  wilaya: '#2ECC71',
  price_range: '#9B59B6',
  keyword: '#A0A0A0',
  combined: '#F39C12',
};

export default function TopSearchesWidget() {
  const [items, setItems] = useState<SearchTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getTopSearches({ limitCount: 7, days: 7 })
      .then(results => {
        setItems(results);
        setTotal(results.reduce((a, b) => a + b.count, 0));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center">
            <Search size={14} className="text-[#C9A84C]"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Top Recherches</p>
            <p className="text-[10px] text-[#555]">cette semaine</p>
          </div>
        </div>
        <Link href="/admin/search-analytics"
          className="flex items-center gap-1 text-[11px] text-[#C9A84C] hover:text-[#E8C96A] transition-colors">
          Voir tout <ArrowRight size={11}/>
        </Link>
      </div>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({length: 5}).map((_,i) => (
              <div key={i} className="flex items-center gap-2">
                <Shimmer className="w-4 h-3" rounded="sm" />
                <Shimmer className="w-1.5 h-1.5" rounded="full" />
                <Shimmer className="h-3 flex-1" rounded="sm" />
                <Shimmer className="h-3 w-6" rounded="sm" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search size={24} className="text-[#333] mb-2"/>
            <p className="text-xs text-[#555]">
              Aucune recherche encore.<br/>
              Les données arrivent après les premières visites.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item, i) => {
              const color = CAT_COLORS[item.category] || '#A0A0A0';
              return (
                <motion.div key={i}
                  initial={{opacity:0, x:-8}} animate={{opacity:1, x:0}}
                  transition={{delay: i * 0.05}}
                  className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-[#1A1A1A] transition-all group">
                  <span className="text-[10px] text-[#555] w-3.5 text-right flex-shrink-0 font-mono">
                    {i + 1}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background: color}}/>
                  <span className="text-xs text-[#A0A0A0] group-hover:text-white transition-colors flex-1 truncate">
                    {item.term}
                  </span>
                  <span className="flex-shrink-0">
                    {item.trend === 'up'
                      ? <ChevronUp size={11} className="text-[#2ECC71]"/>
                      : item.trend === 'down'
                      ? <ChevronDown size={11} className="text-[#E74C3C]"/>
                      : <Minus size={11} className="text-[#333]"/>
                    }
                  </span>
                  <span className="text-xs font-bold text-white flex-shrink-0 w-6 text-right">
                    {item.count}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="px-5 py-2.5 border-t border-[#1E1E1E]">
          <p className="text-[10px] text-[#555] flex items-center gap-1.5">
            <Zap size={9} className="text-[#C9A84C]"/>
            {total} recherches enregistrées cette semaine
          </p>
        </div>
      )}
    </div>
  );
}