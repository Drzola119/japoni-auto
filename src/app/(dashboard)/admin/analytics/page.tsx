'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Car, Users, CheckCircle, Eye, TrendingUp, BarChart2, Download } from 'lucide-react'
import { AnalyticsPageSkeleton, KPIRowSkeleton, ChartSkeleton, DonutSkeleton } from '@/components/admin/Skeletons'

const GOLD = '#C9A84C'
const COLORS = ['#C9A84C','#3498DB','#2ECC71','#E74C3C','#9B59B6','#F39C12','#1ABC9C','#E67E22']
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
const DAYS   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

const WILAYA_COORDS: Record<string,{x:string;y:string}> = {
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

function useCounter(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let cur = 0
    const step = target / (duration / 16)
    const t = setInterval(() => {
      cur += step
      if (cur >= target) { setVal(target); clearInterval(t) }
      else setVal(Math.floor(cur))
    }, 16)
    return () => clearInterval(t)
  }, [target, duration])
  return val
}

const Tip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{name:string;value:number;color:string}>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-xs shadow-xl">
      {label && <p className="text-[#A0A0A0] mb-1.5 font-medium">{label}</p>}
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color}} className="mb-0.5">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [loading, setLoading]     = useState(true)
  const [range, setRange]         = useState<'7'|'30'|'90'|'365'>('365')
  const [listings, setListings]   = useState<Listing[]>([])
  const [monthData, setMonthData] = useState<{month:string;total:number;approved:number;pending:number}[]>([])
  const [brandData, setBrandData] = useState<{name:string;count:number}[]>([])
  const [dayData, setDayData]     = useState<{day:string;count:number}[]>([])
  const [priceData, setPriceData] = useState<{range:string;count:number;min:number;max:number}[]>([])
  const [wilayaData, setWilayaData] = useState<{name:string;count:number;pct:string}[]>([])
  const [kpi, setKpi] = useState({ month:0, users:0, approval:0, active:0 })

  const c1 = useCounter(kpi.month)
  const c2 = useCounter(kpi.users)
  const c3 = useCounter(kpi.approval)
  const c4 = useCounter(kpi.active)

  useEffect(() => {
    async function load() {
      if (!db) return
      setLoading(true)
      try {
        const [lSnap, uSnap] = await Promise.all([
          getDocs(collection(db, 'listings')),
          getDocs(collection(db, 'users')),
        ])
        const ls: Listing[] = lSnap.docs.map(d => ({id:d.id,...d.data()} as Listing))
        setListings(ls)

        const now   = new Date()
        const som   = new Date(now.getFullYear(), now.getMonth(), 1)
        const approved = ls.filter(l => l.status === 'approved').length

        setKpi({
          month:    ls.filter(l => { const d = l.createdAt?.toDate(); return d instanceof Date && d.getTime() >= som.getTime() }).length,
          users:    uSnap.size,
          approval: ls.length ? Math.round((approved/ls.length)*100) : 0,
          active:   approved,
        })

        // Monthly trend
        const monthly = []
        for (let i = 11; i >= 0; i--) {
          const s = new Date(now.getFullYear(), now.getMonth()-i, 1)
          const e = new Date(now.getFullYear(), now.getMonth()-i+1, 0)
          const r = ls.filter(l => { const t=l.createdAt?.toDate(); return t&&t>=s&&t<=e })
          monthly.push({
            month: MONTHS[s.getMonth()],
            total: r.length,
            approved: r.filter(l=>l.status==='approved').length,
            pending:  r.filter(l=>l.status==='pending').length,
          })
        }
        setMonthData(monthly)

        // Brands
        const bm: Record<string,number> = {}
        ls.forEach(l => { if(l.make) bm[l.make]=(bm[l.make]||0)+1 })
        const bs = Object.entries(bm).sort((a,b)=>b[1]-a[1])
        const top = bs.slice(0,8).map(([name,count])=>({name,count}))
        if (bs.length>8) top.push({name:'Autres',count:bs.slice(8).reduce((a,b)=>a+b[1],0)})
        setBrandData(top)

        // Days
        const dd = Array(7).fill(0)
        ls.forEach(l => { const t=l.createdAt?.toDate(); if(t) dd[t.getDay()]++ })
        setDayData(dd.map((count,i)=>({day:DAYS[i],count})))

        // Prices
        const buckets = [
          {range:'< 500K DA',   min:0,       max:500000},
          {range:'500K–1M DA',  min:500000,  max:1000000},
          {range:'1M–2M DA',    min:1000000, max:2000000},
          {range:'2M–3.5M DA',  min:2000000, max:3500000},
          {range:'3.5M–5M DA',  min:3500000, max:5000000},
          {range:'5M–8M DA',    min:5000000, max:8000000},
          {range:'> 8M DA',     min:8000000, max:Infinity},
        ]
        setPriceData(buckets.map(b=>({
          ...b,
          count: ls.filter(l=>l.price!==undefined&&l.price>=b.min&&l.price<b.max).length
        })))

        // Wilayas
        const wm: Record<string,number> = {}
        ls.forEach(l => { if(l.wilaya) wm[l.wilaya]=(wm[l.wilaya]||0)+1 })
        const ws = Object.entries(wm).sort((a,b)=>b[1]-a[1])
        const tot = ws.reduce((a,b)=>a+b[1],0)
        setWilayaData(ws.map(([name,count])=>({name,count,pct:tot?((count/tot)*100).toFixed(1):'0'})))

      } catch(e) {
        console.error('Analytics error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [range])

  const prices  = listings.filter(l=>l.price).map(l=>l.price as number)
  const median  = prices.length ? prices.sort((a,b)=>a-b)[Math.floor(prices.length/2)] : 0
  const avg     = prices.length ? Math.round(prices.reduce((a,b)=>a+b,0)/prices.length) : 0
  const maxDay  = Math.max(...dayData.map(d=>d.count),1)

  if (loading) {
    return <AnalyticsPageSkeleton />
  }

  return (
    <motion.div
      initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
      transition={{duration:0.35}} className="p-6 space-y-6"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <BarChart2 size={20} className="text-[#C9A84C]" /> Analytiques
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">Performances en temps réel</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['7','30','90','365'] as const).map(r => (
            <button key={r} onClick={()=>setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range===r
                  ? 'bg-[#C9A84C] text-black'
                  : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C]/40'
              }`}>
              {r==='365'?'12 mois':r==='90'?'3 mois':r==='30'?'30 jours':'7 jours'}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C]/40 transition-all">
            <Download size={13}/> Exporter
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {icon:Car,         val:c1, label:'Annonces ce Mois',     trend:'+12%'},
          {icon:Users,       val:c2, label:'Utilisateurs Inscrits', trend:'+8%'},
          {icon:CheckCircle, val:c3, label:"Taux d'Approbation",    suffix:'%'},
          {icon:Eye,         val:c4, label:'Annonces Actives',      trend:'+5%'},
        ].map(({icon:Icon,val,label,trend,suffix},i)=>(
          <motion.div key={i}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            transition={{delay:i*0.07,duration:0.35}}
            className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 hover:border-[#C9A84C]/30 hover:shadow-[0_0_20px_rgba(201,168,76,0.08)] transition-all">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[#C9A84C]/10 p-2.5">
                <Icon size={18} className="text-[#C9A84C]"/>
              </div>
              {trend&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20">{trend}</span>}
            </div>
            <p className="text-2xl font-bold text-white mt-3">{val}{suffix||''}</p>
            <p className="text-xs text-[#A0A0A0] mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* LINE CHART */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-[#C9A84C]"/>
          <h2 className="text-sm font-semibold text-white">Évolution des Annonces — 12 Mois</h2>
        </div>
        {loading ? <ChartSkeleton height={320}/> : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={GOLD} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E"/>
              <XAxis dataKey="month" tick={{fill:'#A0A0A0',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#A0A0A0',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Legend wrapperStyle={{fontSize:'11px',paddingTop:'16px'}}/>
              <Area type="monotone" dataKey="total"    name="Total"       stroke={GOLD}      strokeWidth={2.5} fill="url(#gTotal)"/>
              <Area type="monotone" dataKey="approved" name="Approuvées"  stroke="#2ECC71"   strokeWidth={2}   fill="none"/>
              <Area type="monotone" dataKey="pending"  name="En Attente"  stroke="#F39C12"   strokeWidth={2}   fill="none" strokeDasharray="5 5"/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* DONUT + BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* DONUT */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Marques les Plus Populaires</h2>
          {loading ? <ChartSkeleton height={260}/> : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={brandData} dataKey="count" nameKey="name"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} cornerRadius={4}>
                    {brandData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip content={<Tip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {brandData.slice(0,6).map((b,i)=>{
                  const tot=brandData.reduce((a,c)=>a+c.count,0)
                  const pct=tot?Math.round((b.count/tot)*100):0
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                      <span className="text-[#A0A0A0] flex-1 truncate">{b.name}</span>
                      <span className="text-white font-medium w-6 text-right">{b.count}</span>
                      <div className="w-16 h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:COLORS[i%COLORS.length]}}/>
                      </div>
                      <span className="text-[#555] w-7 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* BAR — WEEKDAY */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Activité par Jour de la Semaine</h2>
          <p className="text-xs text-[#A0A0A0] mb-4">Annonces publiées par jour</p>
          {loading ? <ChartSkeleton height={260}/> : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dayData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false}/>
                  <XAxis dataKey="day" tick={{fill:'#A0A0A0',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'#A0A0A0',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="count" name="Annonces" radius={[4,4,0,0]}>
                    {dayData.map((d,i)=>(
                      <Cell key={i} fill={d.count===maxDay?'#E8C96A':GOLD}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {dayData.length>0 && (
                <p className="text-xs mt-2 text-[#A0A0A0]">
                  Jour le plus actif: <span className="text-[#C9A84C] font-medium">
                    {dayData.reduce((a,b)=>a.count>b.count?a:b).day}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* HISTOGRAM — PRICES */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-white">Distribution des Prix</h2>
            <p className="text-xs text-[#A0A0A0] mt-0.5">Répartition par tranche de prix (DA)</p>
          </div>
          {prices.length>0 && (
            <div className="flex gap-5 text-right flex-shrink-0">
              <div>
                <p className="text-[10px] text-[#A0A0A0] uppercase tracking-wide">Médian</p>
                <p className="text-sm font-bold text-[#C9A84C]">{median.toLocaleString('fr-DZ')} DA</p>
              </div>
              <div>
                <p className="text-[10px] text-[#A0A0A0] uppercase tracking-wide">Moyen</p>
                <p className="text-sm font-bold text-white">{avg.toLocaleString('fr-DZ')} DA</p>
              </div>
            </div>
          )}
        </div>
        {loading ? <ChartSkeleton height={280}/> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priceData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" horizontal={false}/>
              <XAxis type="number" tick={{fill:'#A0A0A0',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="range" width={105} tick={{fill:'#A0A0A0',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="count" name="Annonces" radius={[0,4,4,0]} fill={GOLD}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* WILAYA */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Activité par Wilaya</h2>
        {loading ? <ChartSkeleton height={300}/> : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ranked */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3">Top Wilayas</p>
              {wilayaData.slice(0,10).map((w,i)=>(
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1A1A1A] transition">
                  <span className="w-5 h-5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i+1}
                  </span>
                  <span className="text-xs text-white flex-1 truncate">{w.name}</span>
                  <div className="w-14 h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9A84C] rounded-full"
                      style={{width:`${(w.count/(wilayaData[0]?.count||1))*100}%`}}/>
                  </div>
                  <span className="text-[10px] text-[#A0A0A0] w-5 text-right">{w.count}</span>
                </div>
              ))}
            </div>

            {/* SVG MAP */}
            <div className="lg:col-span-2 relative bg-[#0D0D0D] rounded-xl overflow-hidden">
              <svg viewBox="0 0 100 80" className="w-full h-[260px]" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,5 L25,3 L40,2 L55,3 L70,6 L80,12 L85,20 L88,32 L87,45 L83,57 L75,65 L62,70 L48,72 L34,70 L20,63 L10,52 L5,38 L5,24 Z"
                  fill="#0D0D0D" stroke="#333" strokeWidth="0.8"/>
                {wilayaData.slice(0,10).map((w,i)=>{
                  const c=WILAYA_COORDS[w.name]
                  if(!c) return null
                  const max=wilayaData[0]?.count||1
                  const r=2+((w.count/max)*5)
                  return (
                    <g key={i}>
                      <circle cx={c.x} cy={c.y} r={`${r}`} fill={GOLD} fillOpacity={0.85}>
                        <animate attributeName="r" values={`${r};${r+1.2};${r}`} dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <title>{w.name}: {w.count} annonces</title>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
        )}

        {/* FULL TABLE */}
        {!loading && wilayaData.length>0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  {['Wilaya','Annonces','% Total','Répartition'].map(h=>(
                    <th key={h} className="text-left py-2 px-3 text-[#555] font-medium uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wilayaData.map((w,i)=>(
                  <tr key={i} className="border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition">
                    <td className="py-2 px-3 text-white">{w.name}</td>
                    <td className="py-2 px-3 text-[#C9A84C] font-medium">{w.count}</td>
                    <td className="py-2 px-3 text-[#A0A0A0]">{w.pct}%</td>
                    <td className="py-2 px-3">
                      <div className="w-full max-w-[100px] h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A84C] rounded-full" style={{width:`${w.pct}%`}}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  )
}