'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, query, where, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, writeBatch, getDocs, doc as docRef
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { logAdminAction } from '@/lib/auditLog'
import {
  Megaphone, Users, Store, ShoppingBag, MapPin, Send,
  Bell, Mail, CheckCircle2, Eye, Gift
} from 'lucide-react'
import { WILAYAS } from '@/data/wilayas'

interface Broadcast {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'promo'
  recipientType: string
  targetWilayas?: string[]
  recipientCount: number
  sentAt?: { toDate: () => Date }
  sentBy: string
  status: 'sent' | 'scheduled' | 'draft'
}

type RecipientType = 'all_users' | 'all_sellers' | 'all_showrooms' | 'buyers' | 'by_wilaya'
type MessageType = 'notification' | 'internal'
type NotificationType = 'info' | 'success' | 'warning' | 'promo'

export default function BroadcastPage() {
  const { user } = useAuth()
  const [recipients, setRecipients] = useState<RecipientType>('all_users')
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([])
  const [messageType, setMessageType] = useState<MessageType>('notification')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [notificationType, setNotificationType] = useState<NotificationType>('info')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [confirmRead, setConfirmRead] = useState(false)
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false)
  
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [stats, setStats] = useState({ total: 0, read: 0, rate: 0 })
  const [userCounts, setUserCounts] = useState({ all: 0, sellers: 0, showrooms: 0, buyers: 0 })

  useEffect(() => {
    if (!db) return
    const q = query(collection(db!, 'broadcasts'), orderBy('sentAt', 'desc'), limit(10))
    const unsub = onSnapshot(q, (snap) => {
      setBroadcasts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Broadcast)))
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!db) return
    const qUsers = query(collection(db!, 'users'))
    const qSellers = query(collection(db!, 'users'), where('role', '==', 'seller'))
    const qShowrooms = query(collection(db!, 'users'), where('role', '==', 'showroom'))
    
    Promise.all([
      getDocs(qUsers),
      getDocs(qSellers),
      getDocs(qShowrooms)
    ]).then(([allSnap, sellersSnap, showroomsSnap]) => {
      setUserCounts({
        all: allSnap.size,
        sellers: sellersSnap.size,
        showrooms: showroomsSnap.size,
        buyers: allSnap.size - (sellersSnap.size + showroomsSnap.size)
      })
    })
  }, [])

  useEffect(() => {
    if (!db) return
    const q = query(collection(db!, 'notifications'))
    const unsub = onSnapshot(q, (snap) => {
      const total = snap.size
      const read = snap.docs.filter(d => d.data().read === true).length
      setStats({ total, read, rate: total ? Math.round((read / total) * 100) : 0 })
    })
    return () => unsub()
  }, [])

  const estimatedReach = useMemo(() => {
    if (recipients === 'all_users') return userCounts.all
    if (recipients === 'all_sellers') return userCounts.sellers
    if (recipients === 'all_showrooms') return userCounts.showrooms
    if (recipients === 'buyers') return userCounts.buyers
    if (recipients === 'by_wilaya' && selectedWilayas.length > 0) return Math.ceil(selectedWilayas.length * 50)
    return 0
  }, [recipients, selectedWilayas, userCounts])

  const handleSend = async () => {
    if (!db || !user || !title.trim() || !message.trim()) return
    setSending(true)
    try {
      const q = query(collection(db!, 'users'))
      const usersSnap = await getDocs(q)
      const targetUsers = usersSnap.docs.filter(d => {
        const data = d.data()
        if (recipients === 'all_sellers') return data.role === 'seller'
        if (recipients === 'all_showrooms') return data.role === 'showroom'
        if (recipients === 'buyers') return data.role === 'buyer'
        if (recipients === 'by_wilaya' && selectedWilayas.length > 0) {
          return data.wilaya && selectedWilayas.includes(data.wilaya)
        }
        return true
      })

    if (!db || targetUsers.length === 0) {
      setToast('❌ Aucun utilisateur trouvé')
      setTimeout(() => setToast(null), 3000)
      setSending(false)
      return
    }

    const batchSize = 450
    const broadcastId = `bc_${Date.now()}`
    
    for (let i = 0; i < targetUsers.length; i += batchSize) {
      if (!db) break
      const batch = writeBatch(db!)
      targetUsers.slice(i, i + batchSize).forEach(userDoc => {
        const notifRef = docRef(collection(db!, 'notifications'))
          batch.set(notifRef, {
            userId: userDoc.id,
            title: title.trim(),
            message: message.trim(),
            type: notificationType,
            read: false,
            createdAt: serverTimestamp(),
            broadcastId,
            redirectUrl: redirectUrl || null,
            urgent
          })
        })
        await batch.commit()
      }

      const broadcastRef = collection(db!, 'broadcasts')
      await addDoc(broadcastRef, {
        title: title.trim(),
        message: message.trim(),
        type: notificationType,
        recipientType: recipients,
        targetWilayas: recipients === 'by_wilaya' ? selectedWilayas : [],
        recipientCount: targetUsers.length,
        sentAt: serverTimestamp(),
        sentBy: user.uid,
        status: 'sent'
      })

      await logAdminAction('broadcast_sent', user.uid, user.displayName || 'Admin', {
        type: 'broadcast',
        name: title.trim(),
        details: { recipientCount: targetUsers.length }
      })

      setToast(`✅ Diffusion envoyée à ${targetUsers.length} utilisateurs avec succès`)
      setTimeout(() => setToast(null), 3000)
      
      setTitle('')
      setMessage('')
      setSelectedWilayas([])
      setRedirectUrl('')
      setUrgent(false)
      setConfirmRead(false)
      setScheduleDate('')
      setScheduleTime('')
    } catch (e) {
      console.error('Send error:', e)
      setToast('❌ Erreur lors de l\'envoi')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSending(false)
    }
  }

  const toggleWilaya = (w: string) => {
    setSelectedWilayas(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w])
  }

  const typeColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    info: { bg: 'bg-[#3498DB]/10', text: 'text-[#3498DB]', icon: <Bell size={12} /> },
    success: { bg: 'bg-[#2ECC71]/10', text: 'text-[#2ECC71]', icon: <CheckCircle2 size={12} /> },
    warning: { bg: 'bg-[#F39C12]/10', text: 'text-[#F39C12]', icon: <Bell size={12} /> },
    promo: { bg: 'bg-[#C9A84C]/10', text: 'text-[#C9A84C]', icon: <Gift size={12} /> },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 space-y-6"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 shadow-xl"
          >
            <p className="text-sm text-white">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Megaphone size={20} className="text-[#C9A84C]" />
            Nouvelle Diffusion
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">
            Envoyez des notifications à vos utilisateurs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT - Compose */}
        <div className="lg:col-span-2 space-y-6">
          {/* RECIPIENTS */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">1. Choisir les destinataires</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'all_users', icon: Users, label: 'Tous les Utilisateurs', desc: `${userCounts.all} utilisateurs` },
                { id: 'all_sellers', icon: Store, label: 'Tous les Vendeurs', desc: `${userCounts.sellers} vendeurs` },
                { id: 'all_showrooms', icon: Store, label: 'Showrooms', desc: `${userCounts.showrooms} showrooms` },
                { id: 'buyers', icon: ShoppingBag, label: 'Acheteurs', desc: `${userCounts.buyers} acheteurs` },
                { id: 'by_wilaya', icon: MapPin, label: 'Par Wilaya', desc: selectedWilayas.length > 0 ? `${selectedWilayas.length} sélectionnées` : 'Choisir une région' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setRecipients(opt.id as RecipientType); if (opt.id === 'by_wilaya') setShowWilayaDropdown(true) }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    recipients === opt.id
                      ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                      : 'border-[#2A2A2A] hover:border-[#C9A84C]/40'
                  }`}
                >
                  <opt.icon size={20} className={recipients === opt.id ? 'text-[#C9A84C]' : 'text-[#A0A0A0]'} />
                  <p className="text-sm text-white mt-2">{opt.label}</p>
                  <p className="text-xs text-[#A0A0A0]">{opt.desc}</p>
                </button>
              ))}
            </div>

            <AnimatePresence>
              {showWilayaDropdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setSelectedWilayas([...WILAYAS])} className="text-xs text-[#C9A84C]">Tout sélectionner</button>
                    <button onClick={() => setSelectedWilayas([])} className="text-xs text-[#A0A0A0]">Désélectionner</button>
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-h-48 overflow-y-auto p-2">
                    <div className="flex flex-wrap gap-2">
                      {WILAYAS.map(w => (
                        <button
                          key={w}
                          onClick={() => toggleWilaya(w)}
                          className={`px-2 py-1 rounded-lg text-xs transition-all ${
                            selectedWilayas.includes(w)
                              ? 'bg-[#C9A84C] text-black'
                              : 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#2A2A2A]'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-sm text-[#C9A84C] mt-4">
              ✨ Cette diffusion atteindra ~{estimatedReach} utilisateurs
            </p>
          </div>

          {/* MESSAGE TYPE */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">2. Type de message</h2>
            <div className="flex gap-2 mb-4">
              {[
                { id: 'notification', icon: Bell, label: 'Notification' },
                { id: 'internal', icon: Mail, label: 'Message Interne' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMessageType(tab.id as MessageType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                    messageType === tab.id
                      ? 'bg-[#C9A84C] text-black'
                      : 'bg-[#1A1A1A] text-[#A0A0A0]'
                  }`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#A0A0A0] block mb-2">Titre</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Nouvelle fonctionnalité disponible..."
                  className="w-full h-11 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 text-sm text-white placeholder:text-[#555] focus:border-[#C9A84C]/50 ring-1 ring-[#C9A84C]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#A0A0A0] block mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Votre message ici..."
                  minLength={10}
                  className="w-full min-h-[120px] p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder:text-[#555] resize-none focus:border-[#C9A84C]/50 ring-1 ring-[#C9A84C]/20 focus:outline-none"
                />
                <p className={`text-xs text-right mt-1 ${message.length > 450 ? 'text-[#E74C3C]' : 'text-[#555]'}`}>
                  {message.length}/500 caractères
                </p>
              </div>

              <div>
                <label className="text-xs text-[#A0A0A0] block mb-2">Type de notification</label>
                <div className="flex gap-2">
                  {(['info', 'success', 'warning', 'promo'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setNotificationType(t)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                        notificationType === t
                          ? typeColors[t].bg + ' ' + typeColors[t].text + ' border ' + typeColors[t].text.replace('text', 'border')
                          : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0]'
                      }`}
                    >
                      {typeColors[t].icon}
                      {t === 'info' ? 'Info' : t === 'success' ? 'Succès' : t === 'warning' ? 'Avertissement' : 'Promo'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A0A0A0] block mb-2">URL de redirection (optionnel)</label>
                <input
                  value={redirectUrl}
                  onChange={e => setRedirectUrl(e.target.value)}
                  placeholder="/cars ou https://..."
                  className="w-full h-11 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 text-sm text-white placeholder:text-[#555] focus:border-[#C9A84C]/50 focus:outline-none"
                />
                <p className="text-xs text-[#555] mt-1">Si vide, la notification n'aura pas de lien</p>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-[#A0A0A0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={urgent}
                    onChange={e => setUrgent(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2A2A2A] bg-[#1A1A1A] text-[#C9A84C]"
                  />
                  Marquer comme urgent
                </label>
                {messageType === 'internal' && (
                  <label className="flex items-center gap-2 text-sm text-[#A0A0A0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmRead}
                      onChange={e => setConfirmRead(e.target.checked)}
                      className="w-4 h-4 rounded border-[#2A2A2A] bg-[#1A1A1A] text-[#C9A84C]"
                    />
                    Demander confirmation de lecture
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          {title && message && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold text-white mb-4">Aperçu</h2>
              <div className="bg-[#1A1A1A] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Bell size={16} className="text-[#C9A84C]" />
                  <span className="text-sm text-white">{title}</span>
                </div>
                <p className="text-sm text-[#A0A0A0]">{message}</p>
                <p className="text-xs text-[#555] mt-2">Il y a 1 minute</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT - Stats */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
              <Megaphone size={18} className="text-[#C9A84C] mb-2" />
              <p className="text-2xl font-bold text-white">{broadcasts.length}</p>
              <p className="text-xs text-[#A0A0A0]">Diffusions Envoyées</p>
            </div>
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
              <CheckCircle2 size={18} className="text-[#2ECC71] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.read}</p>
              <p className="text-xs text-[#A0A0A0]">Notifications Lues</p>
            </div>
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
              <Eye size={18} className="text-[#3498DB] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.rate}%</p>
              <p className="text-xs text-[#A0A0A0]">Taux de Lecture</p>
            </div>
          </div>

          {/* Recent */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Historique Récent</h3>
            <div className="space-y-2">
              {broadcasts.slice(0, 5).map(bc => (
                <div key={bc.id} className="p-3 rounded-xl hover:bg-[#1A1A1A] transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white truncate">{bc.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      bc.status === 'sent' ? 'bg-[#2ECC71]/10 text-[#2ECC71]' :
                      bc.status === 'scheduled' ? 'bg-[#F39C12]/10 text-[#F39C12]' :
                      'bg-[#555]/10 text-[#555]'
                    }`}>
                      {bc.status === 'sent' ? 'Envoyé' : bc.status === 'scheduled' ? 'Planifié' : 'Brouillon'}
                    </span>
                  </div>
                  <p className="text-xs text-[#555] mt-1">
                    {bc.recipientCount} destinataires
                  </p>
                </div>
              ))}
            </div>
            <a href="/admin/broadcast/history" className="text-xs text-[#C9A84C] mt-4 block">
              Voir tout l'historique →
            </a>
          </div>
        </div>
      </div>

      {/* SEND BUTTON */}
      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !message.trim() || estimatedReach === 0}
        className="w-full h-12 bg-gradient-to-r from-[#C9A84C] to-[#A07830] text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {sending ? (
          <>
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send size={16} />
            Envoyer à {estimatedReach} utilisateurs
          </>
        )}
      </button>

      {/* Keyboard hints */}
      <div className="text-center text-xs text-[#555]">
        Raccourcis: <span className="text-[#A0A0A0]">[Aperçu]</span> •{' '}
        <span className="text-[#A0A0A0]">[Envoyer]</span>
      </div>
    </motion.div>
  )
}