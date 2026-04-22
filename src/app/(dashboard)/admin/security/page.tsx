'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  collection, getDocs, query,
  orderBy, limit, Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import {
  Shield, Activity, Calendar, UserCheck,
  Clock, Search, Download, CheckCircle2,
  XCircle, Trash2, UserX, UserCheck2,
  RefreshCcw, Star, Megaphone, Settings2,
  Users, ChevronLeft, ChevronRight
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  adminUid: string
  adminName: string
  targetId?: string | null
  targetType?: string | null
  targetName?: string | null
  details?: Record<string, unknown>
  createdAt?: Timestamp | null
}

const ACTION_CONFIG: Record<string, {
  label: string
  color: string
  bg: string
  border: string
  icon: React.ReactNode
}> = {
  listing_approved:  { label: 'Annonce Approuvée',    color: '#2ECC71', bg: 'bg-[#2ECC71]/10', border: 'border-[#2ECC71]/30', icon: <CheckCircle2 size={12}/> },
  listing_rejected:  { label: 'Annonce Rejetée',      color: '#E74C3C', bg: 'bg-[#E74C3C]/10', border: 'border-[#E74C3C]/30', icon: <XCircle size={12}/> },
  listing_deleted:   { label: 'Annonce Supprimée',    color: '#E74C3C', bg: 'bg-[#E74C3C]/10', border: 'border-[#E74C3C]/30', icon: <Trash2 size={12}/> },
  user_banned:       { label: 'Utilisateur Banni',    color: '#E74C3C', bg: 'bg-[#E74C3C]/10', border: 'border-[#E74C3C]/30', icon: <UserX size={12}/> },
  user_unbanned:     { label: 'Utilisateur Débanni',  color: '#2ECC71', bg: 'bg-[#2ECC71]/10', border: 'border-[#2ECC71]/30', icon: <UserCheck2 size={12}/> },
  user_role_changed: { label: 'Rôle Modifié',         color: '#3498DB', bg: 'bg-[#3498DB]/10', border: 'border-[#3498DB]/30', icon: <RefreshCcw size={12}/> },
  seller_verified:   { label: 'Vendeur Vérifié',      color: '#C9A84C', bg: 'bg-[#C9A84C]/10', border: 'border-[#C9A84C]/30', icon: <Star size={12}/> },
  seller_unverified: { label: 'Vendeur Dévérifié',    color: '#F39C12', bg: 'bg-[#F39C12]/10', border: 'border-[#F39C12]/30', icon: <Star size={12}/> },
  broadcast_sent:    { label: 'Diffusion Envoyée',    color: '#9B59B6', bg: 'bg-[#9B59B6]/10', border: 'border-[#9B59B6]/30', icon: <Megaphone size={12}/> },
  settings_updated:  { label: 'Paramètres Modifiés',  color: '#A0A0A0', bg: 'bg-[#A0A0A0]/10', border: 'border-[#A0A0A0]/30', icon: <Settings2 size={12}/> },
  admin_login:       { label: 'Connexion Admin',      color: '#3498DB', bg: 'bg-[#3498DB]/10', border: 'border-[#3498DB]/30', icon: <UserCheck size={12}/> },
  bulk_approve:      { label: 'Approbation Groupée',  color: '#2ECC71', bg: 'bg-[#2ECC71]/10', border: 'border-[#2ECC71]/30', icon: <CheckCircle2 size={12}/> },
  bulk_reject:       { label: 'Rejet Groupé',         color: '#E74C3C', bg: 'bg-[#E74C3C]/10', border: 'border-[#E74C3C]/30', icon: <XCircle size={12}/> },
  bulk_delete:       { label: 'Suppression Groupée',  color: '#E74C3C', bg: 'bg-[#E74C3C]/10', border: 'border-[#E74C3C]/30', icon: <Trash2 size={12}/> },
  report_resolved:   { label: 'Rapport Résolu',       color: '#2ECC71', bg: 'bg-[#2ECC71]/10', border: 'border-[#2ECC71]/30', icon: <CheckCircle2 size={12}/> },
  report_deleted:    { label: 'Rapport Supprimé',     color: '#E74C3C', bg: 'bg-[#E74C3C]/10', border: 'border-[#E74C3C]/30', icon: <Trash2 size={12}/> },
}

const DANGER_ACTIONS = ['listing_deleted','user_banned','listing_rejected','bulk_delete','bulk_reject','report_deleted']
const SUCCESS_ACTIONS = ['listing_approved','user_unbanned','seller_verified','bulk_approve','report_resolved']

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60)    return `il y a ${Math.floor(diff)}s`
  if (diff < 3600)  return `il y a ${Math.floor(diff/60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff/3600)}h`
  return `il y a ${Math.floor(diff/86400)}j`
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string|number; label: string }) {
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 hover:border-[#C9A84C]/30 transition-all">
      <div className="rounded-xl bg-[#C9A84C]/10 p-2.5 w-fit mb-3">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-[#A0A0A0] mt-0.5">{label}</p>
    </div>
  )
}

const PAGE_SIZE = 25

export default function SecurityPage() {
  const { user } = useAuth()
  const [logs, setLogs]           = useState<AuditLog[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterDate, setFilterDate]     = useState<'today'|'7'|'30'|'all'>('all')
  const [page, setPage]           = useState(1)

  useEffect(() => {
    async function fetchLogs() {
      if (!db) return
      setLoading(true)
      try {
        const q = query(
          collection(db, 'admin_logs'),
          orderBy('createdAt', 'desc'),
          limit(500)
        )
        const snap = await getDocs(q)
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)))
      } catch (e) {
        console.error('Error loading audit logs:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const filtered = useMemo(() => {
    const now = new Date()
    return logs.filter(log => {
      const date = log.createdAt?.toDate()

      if (filterDate === 'today') {
        if (!date) return false
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        if (date < today) return false
      }
      if (filterDate === '7') {
        if (!date) return false
        const week = new Date(now.getTime() - 7*24*60*60*1000)
        if (date < week) return false
      }
      if (filterDate === '30') {
        if (!date) return false
        const month = new Date(now.getTime() - 30*24*60*60*1000)
        if (date < month) return false
      }

      if (filterAction !== 'all' && log.action !== filterAction) return false

      if (search) {
        const s = search.toLowerCase()
        return (
          log.adminName?.toLowerCase().includes(s) ||
          log.targetName?.toLowerCase().includes(s) ||
          log.action?.toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [logs, search, filterAction, filterDate])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  const today     = new Date(); today.setHours(0,0,0,0)
  const todayCount = logs.filter(l => l.createdAt?.toDate() && l.createdAt.toDate() >= today).length
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthCount = logs.filter(l => l.createdAt?.toDate() && l.createdAt.toDate() >= monthStart).length
  const adminUids  = new Set(logs.filter(l => {
    const d = l.createdAt?.toDate()
    const week = new Date(Date.now() - 7*24*60*60*1000)
    return d && d >= week
  }).map(l => l.adminUid)).size
  const lastLog    = logs[0]?.createdAt?.toDate()

  const last7 = Array.from({length:7}, (_,i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6-i))
    d.setHours(0,0,0,0)
    const next = new Date(d); next.setDate(d.getDate()+1)
    return {
      day: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][d.getDay()],
      count: logs.filter(l => {
        const t = l.createdAt?.toDate()
        return t && t >= d && t < next
      }).length
    }
  })
  const maxBar = Math.max(...last7.map(d=>d.count), 1)

  const exportCSV = () => {
    const headers = ['Date','Admin','Action','Cible','Détails']
    const rows = filtered.map(log => [
      log.createdAt?.toDate()?.toLocaleString('fr-DZ') || '-',
      log.adminName || '-',
      ACTION_CONFIG[log.action]?.label || log.action,
      log.targetName || '-',
      JSON.stringify(log.details || {})
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
            Sécurité & Journal d&apos;Audit
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">
            Toutes les actions administratives sont enregistrées ici
          </p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#C9A84C] text-black hover:bg-[#E8C96A] transition-all">
          <Download size={13}/> Exporter CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Activity size={18} className="text-[#C9A84C]"/>}   value={todayCount}  label="Actions Aujourd'hui"/>
        <StatCard icon={<Calendar size={18} className="text-[#C9A84C]"/>}   value={monthCount}  label="Actions Ce Mois"/>
        <StatCard icon={<UserCheck size={18} className="text-[#C9A84C]"/>}  value={adminUids}   label="Admins Actifs (7j)"/>
        <StatCard icon={<Clock size={18} className="text-[#C9A84C]"/>}
          value={lastLog ? timeAgo(lastLog) : '—'}
          label="Dernière Action"/>
      </div>

      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={15} className="text-[#C9A84C]"/>
          Activité des 7 Derniers Jours
        </h2>
        <div className="flex items-end gap-2 h-20">
          {last7.map((d,i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[9px] text-[#555]">{d.count||''}</span>
              <div className="w-full bg-[#C9A84C]/60 hover:bg-[#C9A84C] rounded-t-md transition-all min-h-[4px]"
                style={{height:`${Math.max((d.count/maxBar)*60, 4)}px`}}
                title={`${d.day}: ${d.count} actions`}/>
              <span className="text-[10px] text-[#A0A0A0]">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"/>
            <input
              value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
              placeholder="Rechercher admin, cible, action..."
              className="w-full h-10 pl-9 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder:text-[#555] focus:border-[#C9A84C]/50 focus:outline-none transition-all"
            />
          </div>
          <select value={filterAction} onChange={e=>{setFilterAction(e.target.value);setPage(1)}}
            className="h-10 px-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm text-[#A0A0A0] focus:border-[#C9A84C]/50 focus:outline-none">
            <option value="all">Toutes les actions</option>
            {Object.entries(ACTION_CONFIG).map(([k,v])=>(
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <div className="flex gap-1">
            {(['today','7','30','all'] as const).map(d=>(
              <button key={d} onClick={()=>{setFilterDate(d);setPage(1)}}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterDate===d
                    ? 'bg-[#C9A84C] text-black'
                    : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C]/40'
                }`}>
                {d==='today'?'Auj.':d==='all'?'Tout':d+'j'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-[#555] mt-2">{filtered.length} entrée{filtered.length!==1?'s':''} trouvée{filtered.length!==1?'s':''}</p>
      </div>

      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1E1E1E]">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield size={15} className="text-[#C9A84C]"/>
            Journal des Actions
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#A0A0A0] text-sm">
            <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
            Chargement du journal...
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={32} className="text-[#333] mx-auto mb-3"/>
            <p className="text-white font-medium">Aucune entrée trouvée</p>
            <p className="text-xs text-[#555] mt-1">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  {['Horodatage','Admin','Action','Cible','Détails'].map(h=>(
                    <th key={h} className="text-left py-3 px-4 text-[#555] font-medium uppercase tracking-wider text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((log,i) => {
                  const cfg    = ACTION_CONFIG[log.action]
                  const date   = log.createdAt?.toDate()
                  const isDanger  = DANGER_ACTIONS.includes(log.action)
                  const isSuccess = SUCCESS_ACTIONS.includes(log.action)
                  const isMe   = log.adminUid === user?.uid
                  return (
                    <tr key={log.id}
                      className={`border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition ${
                        isDanger  ? 'border-l-2 border-l-[#E74C3C]/30' :
                        isSuccess ? 'border-l-2 border-l-[#2ECC71]/30' : ''
                      }`}
                      style={{animationDelay:`${i*0.02}s`}}>

                      <td className="py-3 px-4">
                        <p className="text-white">{date ? timeAgo(date) : '—'}</p>
                        <p className="text-[#555] text-[10px] mt-0.5">
                          {date?.toLocaleDateString('fr-DZ',{day:'2-digit',month:'short',year:'numeric'})}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {log.adminName?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="text-white">{log.adminName || 'Admin'}</p>
                            {isMe && <span className="text-[10px] text-[#C9A84C]">Vous</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {cfg ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${cfg.bg} ${cfg.border}`}
                            style={{color:cfg.color}}>
                            {cfg.icon} {cfg.label}
                          </span>
                        ) : (
                          <span className="text-[#A0A0A0]">{log.action}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {log.targetName ? (
                          <>
                            <p className="text-white truncate max-w-[140px]">{log.targetName}</p>
                            {log.targetType && (
                              <span className="text-[10px] text-[#555] bg-[#1A1A1A] px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                {log.targetType}
                              </span>
                            )}
                          </>
                        ) : <span className="text-[#555]">—</span>}
                      </td>

                      <td className="py-3 px-4">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {log.action === 'listing_rejected' && Array.isArray(log.details.reasons) &&
                              (log.details.reasons as string[]).slice(0,2).map((r:string,ri:number)=>(
                                <span key={ri} className="bg-[#E74C3C]/10 text-[#E74C3C] border border-[#E74C3C]/20 px-1.5 py-0.5 rounded text-[10px]">
                                  {r}
                                </span>
                              ))
                            }
                            {log.action === 'user_role_changed' && (
                              <span className="bg-[#3498DB]/10 text-[#3498DB] border border-[#3498DB]/20 px-1.5 py-0.5 rounded text-[10px]">
                                → {String(log.details.newRole || '')}
                              </span>
                            )}
                            {(log.action === 'bulk_approve' || log.action === 'bulk_reject' || log.action === 'bulk_delete') && (
                              <span className="bg-[#A0A0A0]/10 text-[#A0A0A0] border border-[#A0A0A0]/20 px-1.5 py-0.5 rounded text-[10px]">
                                {String(log.details.count || 0)} éléments
                              </span>
                            )}
                            {log.action === 'broadcast_sent' && (
                              <span className="bg-[#9B59B6]/10 text-[#9B59B6] border border-[#9B59B6]/20 px-1.5 py-0.5 rounded text-[10px]">
                                {String(log.details.recipientCount || 0)} destinataires
                              </span>
                            )}
                            {log.action === 'settings_updated' && (
                              <span className="bg-[#A0A0A0]/10 text-[#A0A0A0] border border-[#A0A0A0]/20 px-1.5 py-0.5 rounded text-[10px]">
                                {String(log.details.section || '')}
                              </span>
                            )}
                          </div>
                        ) : <span className="text-[#555]">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E1E]">
            <p className="text-xs text-[#555]">
              {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] disabled:opacity-40 hover:border-[#C9A84C]/40 transition-all">
                <ChevronLeft size={13}/>
              </button>
              <span className="text-xs text-white px-2">{page} / {totalPages}</span>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] disabled:opacity-40 hover:border-[#C9A84C]/40 transition-all">
                <ChevronRight size={13}/>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Users size={15} className="text-[#C9A84C]"/>
          Sessions Récentes
        </h2>
        {logs.filter(l=>l.action==='admin_login').length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-[#555]">
              Le suivi des sessions sera disponible après la prochaine connexion admin.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.filter(l=>l.action==='admin_login').slice(0,8).map((log,i)=>(
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#1A1A1A] transition">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3498DB]/10 text-[#3498DB] text-xs font-bold flex items-center justify-center">
                    {log.adminName?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="text-xs text-white">{log.adminName}</p>
                    <p className="text-[10px] text-[#555]">
                      {log.createdAt?.toDate()?.toLocaleString('fr-DZ') || '—'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#2ECC71] bg-[#2ECC71]/10 border border-[#2ECC71]/20 px-2 py-0.5 rounded-full">
                  Connecté
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}