import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type AuditAction =
  | 'listing_approved'
  | 'listing_rejected'
  | 'listing_deleted'
  | 'user_banned'
  | 'user_unbanned'
  | 'user_role_changed'
  | 'seller_verified'
  | 'seller_unverified'
  | 'report_resolved'
  | 'report_deleted'
  | 'broadcast_sent'
  | 'settings_updated'
  | 'admin_login'
  | 'bulk_approve'
  | 'bulk_reject'
  | 'bulk_delete'

export interface AuditLogEntry {
  action: AuditAction
  adminUid: string
  adminName: string
  targetId?: string | null
  targetType?: string | null
  targetName?: string | null
  details?: Record<string, unknown>
  createdAt: unknown
}

export async function logAdminAction(
  action: AuditAction,
  adminUid: string,
  adminName: string,
  target?: {
    id?: string
    type?: string
    name?: string
    details?: Record<string, unknown>
  }
): Promise<void> {
  if (!db) return
  try {
    await addDoc(collection(db, 'admin_logs'), {
      action,
      adminUid,
      adminName,
      targetId:   target?.id   || null,
      targetType: target?.type || null,
      targetName: target?.name || null,
      details:    target?.details || {},
      createdAt:  serverTimestamp(),
    })
  } catch (error) {
    console.warn('Audit log failed silently:', error)
  }
}

export const auditHelpers = {
  approveListing: (adminUid: string, adminName: string, listingId: string, listingTitle: string) =>
    logAdminAction('listing_approved', adminUid, adminName,
      { id: listingId, type: 'listing', name: listingTitle }),

  rejectListing: (adminUid: string, adminName: string, listingId: string, listingTitle: string, reasons: string[]) =>
    logAdminAction('listing_rejected', adminUid, adminName,
      { id: listingId, type: 'listing', name: listingTitle, details: { reasons } }),

  deleteListing: (adminUid: string, adminName: string, listingId: string, listingTitle: string) =>
    logAdminAction('listing_deleted', adminUid, adminName,
      { id: listingId, type: 'listing', name: listingTitle }),

  banUser: (adminUid: string, adminName: string, userId: string, userName: string) =>
    logAdminAction('user_banned', adminUid, adminName,
      { id: userId, type: 'user', name: userName }),

  unbanUser: (adminUid: string, adminName: string, userId: string, userName: string) =>
    logAdminAction('user_unbanned', adminUid, adminName,
      { id: userId, type: 'user', name: userName }),

  changeRole: (adminUid: string, adminName: string, userId: string, userName: string, newRole: string) =>
    logAdminAction('user_role_changed', adminUid, adminName,
      { id: userId, type: 'user', name: userName, details: { newRole } }),

  verifySeller: (adminUid: string, adminName: string, sellerId: string, sellerName: string) =>
    logAdminAction('seller_verified', adminUid, adminName,
      { id: sellerId, type: 'seller', name: sellerName }),

  sendBroadcast: (adminUid: string, adminName: string, broadcastId: string, title: string, count: number) =>
    logAdminAction('broadcast_sent', adminUid, adminName,
      { id: broadcastId, type: 'broadcast', name: title, details: { recipientCount: count } }),

  updateSettings: (adminUid: string, adminName: string, section: string) =>
    logAdminAction('settings_updated', adminUid, adminName,
      { type: 'settings', details: { section } }),

  bulkApprove: (adminUid: string, adminName: string, count: number) =>
    logAdminAction('bulk_approve', adminUid, adminName,
      { type: 'listing', details: { count } }),

  bulkReject: (adminUid: string, adminName: string, count: number) =>
    logAdminAction('bulk_reject', adminUid, adminName,
      { type: 'listing', details: { count } }),

  bulkDelete: (adminUid: string, adminName: string, count: number) =>
    logAdminAction('bulk_delete', adminUid, adminName,
      { type: 'listing', details: { count } }),
}