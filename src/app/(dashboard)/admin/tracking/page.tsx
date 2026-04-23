'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, getDocs, query,
  orderBy, limit, Timestamp, where
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  Shield, Monitor, Smartphone, Tablet,
  Search, RefreshCw, AlertTriangle,
  Globe, Clock, Users, Activity,
  Wifi, Eye, ChevronLeft, ChevronRight,
  CheckCircle2
} from 'lucide-react'
import { TrackingPageSkeleton } from '@/components/admin/Skeletons'

interface SessionLog {
  id: string
  userId: string
  userEmail: string
  userName?: string
  role?: string
  device: 'mobile' | 'desktop' | 'tablet'
  browser: string
  os: string
  ip: string
  isNewDevice: boolean
  createdAt?: Timestamp | null
}

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60)    return `${Math.floor(diff)}s ago`
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

function DeviceBadge({ device }: { device: string }) {
  const map: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
    desktop: { icon: <Monitor size={11}/>, cls: 'bg-[#3498DB]/20 text-[#3498DB] border-[#3498DB]/30', label: 'desktop' },
    mobile: { icon: <Smartphone size={11}/>, cls: 'bg-[#9B59B6]/20 text-[#9B59B6] border-[#9B59B6]/30', label: 'mobile' },
    tablet: { icon: <Tablet size={11}/>, cls: 'bg-[#F39C12]/20 text-[#F39C12] border-[#F39C12]/30', label: 'tablet' },
  }
  const cfg = map[device] || map.desktop
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function RoleBadge({ role }: { role?: string }) {
  const map: Record<string, string> = {
    admin: 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/30',
    seller: 'bg-[#3498DB]/20 text-[#3498DB] border-[#3498DB]/30',
    user: 'bg-[#A0A0A0]/20 text-[#A0A0A0] border-[#A0A0A0]/30',
  }
  const cls = map[role || 'user'] || map.user
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${cls}`}>
      {role || 'user'}
    </span>
  )
}

const PAGE_SIZE = 20

export default function TrackingPage() {
  const [sessions,    setSessions]    = useState<SessionLog[]>([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState<'sessions'|'alerts'|'devices'>('sessions')
  const [search,      setSearch]      = useState('')
  const [filterDev,   setFilterDev]   = useState<'all'|'desktop'|'mobile'|'tablet'>('all')
  const [newOnly,     setNewOnly]     = useState(false)
  const [page,        setPage]        = useState(1)

  const load = async () => {
    if (!db) return
    setLoading(true)
    try {
      const q = query(
        collection(db!, 'user_sessions'),
        orderBy('createdAt', 'desc'),
        limit(500)
      )
      const snap = await getDocs(q)
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as SessionLog)))
    } catch (e) {
      console.error('Tracking load error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const now       = new Date()
  const yesterday = new Date(now.getTime() - 24*60*60*1000)
  const last24h   = sessions.filter(s => {
    const d = s.createdAt?.toDate()
    return d && d >= yesterday
  })
  const uniqueUsers  = new Set(sessions.map(s => s.userId)).size
  const newDevices   = sessions.filter(s => s.isNewDevice).length
  const openAlerts   = sessions.filter(s => {
    const d = s.createdAt?.toDate()
    const week = new Date(now.getTime() - 7*24*60*60*1000)
    return s.isNewDevice && d && d >= week
  }).length

  const deviceBreakdown = {
    desktop: sessions.filter(s => s.device === 'desktop').length,
    mobile:  sessions.filter(s => s.device === 'mobile').length,
    tablet:  sessions.filter(s => s.device === 'tablet').length,
  }

  const uniqueIPs = new Set(sessions.map(s => s.ip)).size

  const browserMap: Record<string, number> = {}
  sessions.forEach(s => { browserMap[s.browser] = (browserMap[s.browser]||0)+1 })
  const browsers = Object.entries(browserMap).sort((a,b)=>b[1]-a[1])

  const osMap: Record<string, number> = {}
  sessions.forEach(s => { osMap[s.os] = (osMap[s.os]||0)+1 })
  const osList = Object.entries(osMap).sort((a,b)=>b[1]-a[1])

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (filterDev !== 'all' && s.device !== filterDev) return false
      if (newOnly && !s.isNewDevice) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          s.userEmail?.toLowerCase().includes(q) ||
          s.ip?.toLowerCase().includes(q) ||
          s.browser?.toLowerCase().includes(q) ||
          s.os?.toLowerCase().includes(q) ||
          s.userName?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [sessions, filterDev, newOnly, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  const alerts = sessions.filter(s => s.isNewDevice)

  const devicesList = useMemo(() => {
    const seen = new Map<string, SessionLog & { lastSeen: Date; count: number }>()
    sessions.forEach(s => {
      const key = `${s.ip}_${s.device}_${s.browser}`
      if (!seen.has(key)) {
        seen.set(key, {
          ...s,
          lastSeen: s.createdAt?.toDate() || new Date(),
          count: 1
        })
      } else {
        const existing = seen.get(key)!
        existing.count++
        const d = s.createdAt?.toDate()
        if (d && d > existing.lastSeen) existing.lastSeen = d
      }
    })
    return Array.from(seen.values()).sort((a,b) => b.lastSeen.getTime() - a.lastSeen.getTime())
  }, [sessions])

  if (loading) {
    return <TrackingPageSkeleton />
  }

  return (
    <motion.div
      initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
      transition={{duration:0.35}} className="p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield size={20} className="text-[#C9A84C]"/>
            Centre de Suivi & S&#233;curit&#233;
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">
            Surveillance des sessions, appareils et connexions en temps r&#233;el
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C]/40 transition-all">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Activity size={18} className="text-[#C9A84C]"/>,      val: last24h.length,  label: 'Connexions (24h)',      sub: 'derni&#232;res 24 heures' },
          { icon: <Users    size={18} className="text-[#C9A84C]"/>,      val: uniqueUsers,     label: 'Utilisateurs Uniques',  sub: 'total historique' },
          { icon: <Monitor  size={18} className="text-[#C9A84C]"/>,      val: newDevices,      label: 'Nouveaux Appareils',    sub: 'jamais vus avant' },
          { icon: <AlertTriangle size={18} className="text-[#E74C3C]"/>, val: openAlerts,      label: 'Alertes Ouvertes',      sub: 'appareils suspects' },
        ].map(({ icon, val, label, sub }, i) => (
          <motion.div key={i}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            transition={{delay:i*0.07}}
            className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 hover:border-[#C9A84C]/30 transition-all">
            <div className="rounded-xl bg-[#C9A84C]/10 p-2.5 w-fit mb-3">{icon}</div>
            <p className="text-2xl font-bold text-white">{val}</p>
            <p className="text-xs text-white font-medium mt-0.5">{label}</p>
            <p className="text-[10px] text-[#555] mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#0D1117] border border-[#1E2A38] rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-[#1E2A38]">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Shield size={16} className="text-[#3498DB]"/>
            Security Audit Center
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={()=>setActiveTab('sessions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab==='sessions'
                  ? 'bg-[#3498DB] text-white'
                  : 'bg-[#111111] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#3498DB]/40'
              }`}>
              <Activity size={12}/>
              Sessions ({sessions.length})
            </button>
            <button onClick={()=>setActiveTab('alerts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab==='alerts'
                  ? 'bg-[#F39C12] text-black'
                  : 'bg-[#111111] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#F39C12]/40'
              }`}>
              <AlertTriangle size={12}/>
              Alertes ({openAlerts} ouvertes)
            </button>
            <button onClick={()=>setActiveTab('devices')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab==='devices'
                  ? 'bg-[#9B59B6] text-white'
                  : 'bg-[#111111] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#9B59B6]/40'
              }`}>
              <Monitor size={12}/>
              Appareils ({devicesList.length})
            </button>
          </div>
        </div>

        {activeTab === 'sessions' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-3 border-b border-[#1E2A38]">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"/>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Rechercher..."
                className="w-full h-9 pl-8 pr-3 bg-[#111111] border border-[#2A2A2A] rounded-lg text-xs text-white placeholder:text-[#555] focus:border-[#3498DB]/50 focus:outline-none transition-all"
              />
            </div>
            <select value={filterDev} onChange={e=>{setFilterDev(e.target.value as typeof filterDev);setPage(1)}}
              className="h-9 px-3 bg-[#111111] border border-[#2A2A2A] rounded-lg text-xs text-[#A0A0A0] focus:outline-none">
              <option value="all">Tous les appareils</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablette</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={newOnly} onChange={e=>{setNewOnly(e.target.checked);setPage(1)}}
                className="w-3.5 h-3.5 accent-[#C9A84C]"/>
              <span className="text-xs text-[#A0A0A0]">Nouveaux appareils seulement</span>
            </label>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'sessions' && (
            <motion.div key="sessions"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              transition={{duration:0.2}}>
              {loading ? (
                <div className="p-10 text-center">
                  <div className="w-6 h-6 border-2 border-[#3498DB] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
                  <p className="text-xs text-[#A0A0A0]">Chargement des sessions...</p>
                </div>
              ) : paginated.length === 0 ? (
                <div className="p-12 text-center">
                  <Shield size={32} className="text-[#333] mx-auto mb-3"/>
                  <p className="text-sm text-white font-medium">Aucune session trouv&#233;e</p>
                  <p className="text-xs text-[#555] mt-1">
                    Les sessions appara&#238;ront ici apr&#232;s la prochaine connexion utilisateur.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[750px]">
                    <thead>
                      <tr className="border-b border-[#1E2A38]">
                        {['Heure','Email','Appareil','Navigateur / OS','Adresse IP','R&#244;le','Statut'].map(h=>(
                          <th key={h} className="text-left py-3 px-4 text-[#555] font-medium uppercase tracking-wider text-[10px]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((s, i) => {
                        const date = s.createdAt?.toDate()
                        return (
                          <tr key={s.id}
                            className="border-b border-[#1A2030] hover:bg-[#111827] transition group">
                            <td className="py-3 px-4">
                              <p className="text-white">{date ? date.toLocaleString('fr-DZ', { month:'short', day:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '&#8212;'}</p>
                              <p className="text-[#555] text-[10px] mt-0.5">{date ? timeAgo(date) : ''}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white truncate max-w-[180px]">{s.userEmail}</p>
                              {s.userName && <p className="text-[#555] text-[10px] mt-0.5">{s.userName}</p>}
                            </td>
                            <td className="py-3 px-4">
                              <DeviceBadge device={s.device}/>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white">{s.browser} / {s.os}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-[#A0A0A0] font-mono text-[11px]">{s.ip}</p>
                            </td>
                            <td className="py-3 px-4">
                              <RoleBadge role={s.role}/>
                            </td>
                            <td className="py-3 px-4">
                              {s.isNewDevice ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/30 animate-pulse">
                                  NEW
                                </span>
                              ) : (
                                <CheckCircle2 size={14} className="text-[#2ECC71]/40"/>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-[#1E2A38]">
                  <p className="text-xs text-[#555]">
                    {((page-1)*PAGE_SIZE)+1}&#8211;{Math.min(page*PAGE_SIZE, filtered.length)} sur {filtered.length} sessions
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#111111] border border-[#2A2A2A] text-[#A0A0A0] disabled:opacity-30 hover:border-[#3498DB]/40 transition-all">
                      <ChevronLeft size={13}/>
                    </button>
                    <span className="text-xs text-white px-2">{page}/{totalPages}</span>
                    <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#111111] border border-[#2A2A2A] text-[#A0A0A0] disabled:opacity-30 hover:border-[#3498DB]/40 transition-all">
                      <ChevronRight size={13}/>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div key="alerts"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              transition={{duration:0.2}}
              className="p-5">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={36} className="text-[#2ECC71]/40 mx-auto mb-3"/>
                  <p className="text-white font-medium">Aucune alerte ouverte</p>
                  <p className="text-xs text-[#555] mt-1">Aucun appareil suspect d&#233;tect&#233;. La plateforme est saine.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#A0A0A0] mb-4">
                    {alerts.length} connexion{alerts.length!==1?'s':''} depuis un nouvel appareil d&#233;tect&#233;e{alerts.length!==1?'s':''}
                  </p>
                  {alerts.map((s,i) => {
                    const date = s.createdAt?.toDate()
                    return (
                      <div key={i}
                        className="flex items-start gap-3 p-4 bg-[#1A1A1A] border border-[#E74C3C]/20 rounded-xl hover:border-[#E74C3C]/40 transition-all">
                        <div className="w-8 h-8 rounded-full bg-[#E74C3C]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle size={14} className="text-[#E74C3C]"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm text-white font-medium truncate">{s.userEmail}</p>
                            <span className="text-[10px] text-[#E74C3C] bg-[#E74C3C]/10 border border-[#E74C3C]/20 px-2 py-0.5 rounded-full flex-shrink-0">
                              Nouvel appareil
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-[11px] text-[#A0A0A0]">
                              <Globe size={10}/> {s.ip}
                            </span>
                            <DeviceBadge device={s.device}/>
                            <span className="text-[11px] text-[#A0A0A0]">{s.browser} / {s.os}</span>
                            {date && <span className="text-[11px] text-[#555]">{timeAgo(date)}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'devices' && (
            <motion.div key="devices"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              transition={{duration:0.2}}
              className="p-5 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:'Desktop', count:deviceBreakdown.desktop, icon:<Monitor size={16}/>,    color:'#3498DB' },
                  { label:'Mobile',  count:deviceBreakdown.mobile,  icon:<Smartphone size={16}/>, color:'#9B59B6' },
                  { label:'Tablette',count:deviceBreakdown.tablet,  icon:<Tablet size={16}/>,     color:'#F39C12' },
                ].map((d,i)=>(
                  <div key={i} className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 text-center">
                    <div className="mx-auto w-8 h-8 rounded-full flex items-center justify-center mb-2"
                      style={{background:`${d.color}20`,color:d.color}}>
                      {d.icon}
                    </div>
                    <p className="text-xl font-bold text-white">{d.count}</p>
                    <p className="text-[11px] text-[#A0A0A0]">{d.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
                  <p className="text-xs font-semibold text-white mb-3">Navigateurs</p>
                  <div className="space-y-2">
                    {browsers.slice(0,5).map(([b,c],i)=>{
                      const max = browsers[0]?.[1] || 1
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-[#A0A0A0] flex-1">{b}</span>
                          <div className="w-20 h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                            <div className="h-full bg-[#C9A84C] rounded-full" style={{width:`${(c/max)*100}%`}}/>
                          </div>
                          <span className="text-white w-5 text-right">{c}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
                  <p className="text-xs font-semibold text-white mb-3">Syst&#232;mes d&apos;exploitation</p>
                  <div className="space-y-2">
                    {osList.slice(0,5).map(([o,c],i)=>{
                      const max = osList[0]?.[1] || 1
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-[#A0A0A0] flex-1">{o}</span>
                          <div className="w-20 h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                            <div className="h-full bg-[#3498DB] rounded-full" style={{width:`${(c/max)*100}%`}}/>
                          </div>
                          <span className="text-white w-5 text-right">{c}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <Wifi size={13} className="text-[#C9A84C]"/>
                  {devicesList.length} combinaisons appareil / IP uniques
                </p>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                  {devicesList.map((d,i)=>(
                    <div key={i}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#111111] border border-[#2A2A2A] hover:border-[#C9A84C]/20 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <DeviceBadge device={d.device}/>
                        <div className="min-w-0">
                          <p className="text-xs text-white truncate">{d.userEmail}</p>
                          <p className="text-[10px] text-[#555] font-mono">{d.ip} &#183; {d.browser} / {d.os}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-[#A0A0A0]">{d.count} connexion{d.count!==1?'s':''}</p>
                        <p className="text-[10px] text-[#555]">{timeAgo(d.lastSeen)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-5 py-3 border-t border-[#1E2A38] flex items-start gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#3498DB] mt-0.5 flex-shrink-0"/>
          <p className="text-[10px] text-[#555] leading-relaxed">
            <span className="text-[#A0A0A0] font-medium">Note de confidentialit&#233;:</span>{' '}
            Les m&#233;tadonn&#233;es de connexion (IP, appareil, horodatage) sont collect&#233;es
            &#224; des fins de s&#233;curit&#233; et de pr&#233;vention de la fraude. Les donn&#233;es sont
            conserv&#233;es pendant 90 jours et sont uniquement accessibles aux administrateurs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5">
          <p className="text-xs text-[#A0A0A0] mb-3 flex items-center gap-1.5">
            <Globe size={13} className="text-[#C9A84C]"/> Adresses IP Uniques
          </p>
          <p className="text-3xl font-bold text-white">{uniqueIPs}</p>
          <p className="text-xs text-[#555] mt-1">IPs distinctes enregistr&#233;es</p>
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5">
          <p className="text-xs text-[#A0A0A0] mb-3 flex items-center gap-1.5">
            <Eye size={13} className="text-[#C9A84C]"/> Total Sessions
          </p>
          <p className="text-3xl font-bold text-white">{sessions.length}</p>
          <p className="text-xs text-[#555] mt-1">connexions enregistr&#233;es</p>
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5">
          <p className="text-xs text-[#A0A0A0] mb-3 flex items-center gap-1.5">
            <Clock size={13} className="text-[#C9A84C]"/> Derni&#232;re Connexion
          </p>
          <p className="text-sm font-bold text-white">
            {sessions[0]?.createdAt?.toDate()
              ? sessions[0].createdAt!.toDate().toLocaleString('fr-DZ',{
                  day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'
                })
              : '&#8212;'}
          </p>
          <p className="text-xs text-[#555] mt-1">
            {sessions[0]?.userEmail || 'Aucune session'}
          </p>
        </div>
      </div>

    </motion.div>
  )
}