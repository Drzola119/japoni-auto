'use client';

import { m as motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import CountUp from 'react-countup';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
}

export default function StatsCard({ icon: Icon, value, label, trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(201,168,76,0.12)' }}
      className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 transition-all duration-300 group hover:border-[#C9A84C]/30"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-[#C9A84C]/10 p-3 text-[#C9A84C] group-hover:bg-[#C9A84C]/20 transition-colors">
          <Icon size={24} />
        </div>
        {trend && (
          <div className={cn(
            "px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1",
            trend.isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend.value}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="text-3xl font-bold text-white font-inter">
          <CountUp end={value} duration={2} separator="," />
        </div>
        <div className="text-sm text-[#A0A0A0] mt-1 uppercase tracking-wider font-medium">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
