'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Car, Users, CheckCircle, Eye,
  TrendingUp, BarChart2, Download
} from 'lucide-react'

const GOLD = '#C9A84C'
const CHART_COLORS = ['#C9A84C','#3498DB','#2ECC71','#E74C3C','#9B59B6','#F39C12','#1ABC9C','#E67E22']
const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
const DAYS_FR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

const WILAYAS_COORDS: Record<string, {x:string;y:string}> = {
  'Alger':       {x:'52%',y:'22%'},
  'Oran':        {x:'20%',y:'25%'},
  'Constantine': {x:'62%',y:'20%'},
  'Sétif':       {x:'58%',y:'25%'},
  'Blida':       {x:'48%',y:'26%'},
  'Annaba':      {x:'70%',y:'17%'},
  'Batna':       {x:'62%',y:'28%'},
  'Tizi Ouzou':  {x:'54%',y:'20%'},
  'Béjaïa':      {x:'58%',y:'18%'},
  'Tlemcen':     {x:'14%',y:'24%'},
}

interface Listing {
  id: string
  createdAt?: { toDate: () => Date }
  make?: string
  price?: number
  wilaya?: string
  status?: string
  views?: number
}

interface MonthData { month: string; total: number; approved: number; pending: number }
interface BrandData { name: string; count: number }
interface DayData { day: string; count: number }
interface PriceData { range: string; count: number; min: number; max: number }
interface WilayaData { name: string; count: number; pct: string }


function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#1A1A1A] rounded-xl ${className}`} />
  )
}

const DarkTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: Array<{name:string;value:number;color:string}>; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-xs">
      {label && <p className="text-[#A0A0A0] mb-2 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="mb-0.5">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

