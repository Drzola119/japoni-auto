import { collection, addDoc, getDocs, query,
  where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface SessionLog {
  id?: string
  userId: string
  userEmail: string
  userName?: string
  role?: string
  device: 'mobile' | 'desktop' | 'tablet'
  browser: string
  os: string
  ip: string
  userAgent: string
  isNewDevice: boolean
  createdAt?: Timestamp | null
}

function detectDevice(ua: string): 'mobile' | 'desktop' | 'tablet' {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile'
  return 'desktop'
}

function detectBrowser(ua: string): string {
  if (ua.includes('Edg/'))     return 'Edge'
  if (ua.includes('OPR/'))     return 'Opera'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  if (ua.includes('Chrome/'))  return 'Chrome'
  return 'Unknown'
}

function detectOS(ua: string): string {
  if (ua.includes('Windows NT 11')) return 'Windows 11'
  if (ua.includes('Windows NT 10')) return 'Windows 10'
  if (ua.includes('Windows'))       return 'Windows'
  if (ua.includes('Mac OS X'))      return 'macOS'
  if (ua.includes('Android'))       return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Linux'))         return 'Linux'
  return 'Unknown'
}

async function getClientIP(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json')
    const data = await res.json() as { ip: string }
    return data.ip
  } catch {
    return 'Unknown'
  }
}

export async function logUserSession(
  userId: string,
  userEmail: string,
  userName?: string,
  role?: string
): Promise<void> {
  if (!db || typeof window === 'undefined') return
  try {
    const ua      = navigator.userAgent
    const device  = detectDevice(ua)
    const browser = detectBrowser(ua)
    const os      = detectOS(ua)
    const ip      = await getClientIP()

    const prevSessions = await getDocs(query(
      collection(db!, 'user_sessions'),
      where('userId', '==', userId),
      where('ip', '==', ip),
      orderBy('createdAt', 'desc'),
      limit(5)
    ))
    const isNewDevice = prevSessions.empty

    await addDoc(collection(db!, 'user_sessions'), {
      userId,
      userEmail,
      userName:    userName || userEmail.split('@')[0],
      role:        role || 'user',
      device,
      browser,
      os,
      ip,
      userAgent:   ua,
      isNewDevice,
      createdAt:   serverTimestamp(),
    })
  } catch (error) {
    console.warn('Session tracking failed silently:', error)
  }
}