/**
 * Local Storage Persistence & Multi-User Management for Appointments
 * 
 * Ensures appointments booked across all users are immediately reflected in
 * both the Patient Schedule and the Chief Admin Portal.
 */

import type { StoredAppointment, AppointmentStatus } from './types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'wecare_user_appointments_v2';

// Set of known mock/fake booking IDs to purge and reject permanently
export const FAKE_MOCK_BOOKING_IDS = new Set<string>([
  'WC-2026-7821',
  'WC-2026-4412',
  'WC-2026-8903',
  'WC-2026-3392',
  'WC-2026-5519',
  'WC-2026-1190',
  'WC-2026-6204',
  'WC-2026-9041',
]);

export function isMockAppointment(bookingId?: string): boolean {
  if (!bookingId) return false;
  return FAKE_MOCK_BOOKING_IDS.has(bookingId);
}

// Initial state must be completely blank — NO fake or pre-seeded appointments!
export const INITIAL_MOCK_APPOINTMENTS: StoredAppointment[] = [];

/**
 * Accurately extracts a numeric epoch timestamp (in milliseconds) from any appointment.
 * Evaluates timestamp, createdAtIso, savedAt, syncedAt, scheduled date/time, and booking ID.
 */
export function getAppointmentCreationTimestamp(appt: StoredAppointment): number {
  if (!appt) return 0;

  // 1. Explicit numeric timestamp
  if (typeof appt.timestamp === 'number' && !isNaN(appt.timestamp) && appt.timestamp > 0) {
    return appt.timestamp;
  }

  // 2. ISO timestamp strings (createdAtIso, savedAt, or syncedAt)
  const isoCandidates = [appt.createdAtIso, appt.savedAt, (appt as any).syncedAt];
  for (const iso of isoCandidates) {
    if (iso) {
      const parsed = new Date(iso).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  // 3. Try parsing createdAt (e.g. if it is an ISO or date string)
  if (appt.createdAt) {
    const parsed = new Date(appt.createdAt).getTime();
    if (!isNaN(parsed) && parsed > 100000000000) return parsed;
  }

  // 4. Fallback: Parse scheduled appointment date + time (e.g. "2026-09-15 10:00 AM")
  if (appt.date) {
    const timeClean = appt.time ? ` ${appt.time}` : '';
    const parsed = new Date(`${appt.date}${timeClean}`).getTime();
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return 0;
}

/**
 * Sorts appointments chronologically in descending order:
 * The most recently registered/booked patient appointment appears FIRST (at the front).
 */
export function sortAppointmentsDescending(list: StoredAppointment[]): StoredAppointment[] {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const timeA = getAppointmentCreationTimestamp(a);
    const timeB = getAppointmentCreationTimestamp(b);
    if (timeA !== timeB) {
      return timeB - timeA; // Descending: newest first
    }
    // Secondary fallback: bookingId lexical reverse
    return (b.bookingId || '').localeCompare(a.bookingId || '');
  });
}

/**
 * Get stored appointments: strictly only returns appointments scheduled by real patients,
 * automatically sorted newest/latest registered first.
 */
export function getStoredAppointments(): StoredAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      let changed = false;
      // Filter out any mock/fake appointments and migrate doctor image paths
      const realAppointments = parsed
        .filter((appt: StoredAppointment) => appt && appt.bookingId && !isMockAppointment(appt.bookingId))
        .map((appt: StoredAppointment) => {
          if (appt.doctorImage && appt.doctorImage.startsWith('/doctors/')) {
            appt.doctorImage = appt.doctorImage.replace(/^\/doctors\//, '/doctor-images/');
            changed = true;
          }
          if (!appt.doctorImage && appt.doctorId) {
            appt.doctorImage = `/doctor-images/${appt.doctorId}.jpg`;
            changed = true;
          }
          return appt;
        });

      // Always sort descending: latest registered patient comes first
      const sorted = sortAppointmentsDescending(realAppointments);

      // If fake mock items were removed or paths were migrated, update localStorage
      if (changed || realAppointments.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      }
      return sorted;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Filter appointments for a specific user.
 * Returns an empty array if the user has not booked any appointments yet.
 */
export function getUserAppointments(user: { email?: string; id?: string; uid?: string } | null): StoredAppointment[] {
  if (!user || !user.email) {
    return [];
  }
  const all = getStoredAppointments();
  const userEmail = user.email.toLowerCase().trim();
  const userId = user.id || user.uid;

  const filtered = all.filter((appt) => {
    const apptEmail = appt.email ? appt.email.toLowerCase().trim() : '';
    const matchEmail = apptEmail === userEmail;
    const matchUserId = userId ? appt.userId === userId : false;

    return (matchEmail || matchUserId) && !isMockAppointment(appt.bookingId);
  });

  return sortAppointmentsDescending(filtered);
}

export function saveAppointment(appointment: StoredAppointment): void {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();
    const enrichedAppt: StoredAppointment = {
      ...appointment,
      timestamp: appointment.timestamp || now,
      createdAtIso: appointment.createdAtIso || new Date(now).toISOString(),
      savedAt: appointment.savedAt || new Date(now).toISOString(),
    };
    const current = getStoredAppointments();
    const updated = sortAppointmentsDescending([
      enrichedAppt,
      ...current.filter((a) => a.bookingId !== enrichedAppt.bookingId),
    ]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('wecare_appointments_changed'));

    // Write to Firebase Cloud Firestore collection 'appointments'
    setDoc(doc(db, 'appointments', enrichedAppt.bookingId), enrichedAppt)
      .then(() => {
        console.info(`[Firebase Firestore] Appointment ${enrichedAppt.bookingId} successfully recorded in cloud.`);
      })
      .catch((fsErr: any) => {
        console.warn(`[Firebase Firestore Note] Cloud sync: ${fsErr.code || fsErr.message}. If permission-denied, update Firestore Rules in Firebase Console.`);
      });
  } catch (err) {
    console.error('Failed to save appointment', err);
  }
}

export function updateStoredAppointment(updatedAppointment: StoredAppointment): StoredAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredAppointments();
    const updated = current.map((item) =>
      item.bookingId === updatedAppointment.bookingId
        ? { ...updatedAppointment, lastUpdated: new Date().toLocaleTimeString() }
        : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('wecare_appointments_changed'));
    return updated;
  } catch {
    return getStoredAppointments();
  }
}

export function updateStoredAppointmentStatus(bookingId: string, status: AppointmentStatus): StoredAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredAppointments();
    const updated = current.map((item) =>
      item.bookingId === bookingId
        ? { ...item, status, lastUpdated: new Date().toLocaleTimeString() }
        : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('wecare_appointments_changed'));

    // Sync status change to Firebase Firestore
    updateDoc(doc(db, 'appointments', bookingId), {
      status,
      lastUpdated: new Date().toISOString(),
    }).catch(() => {
      // Graceful fallback if offline or restricted
    });

    return updated;
  } catch {
    return getStoredAppointments();
  }
}

export function updateStoredAppointmentNotes(bookingId: string, adminNotes: string): StoredAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredAppointments();
    const updated = current.map((item) =>
      item.bookingId === bookingId
        ? { ...item, adminNotes, lastUpdated: new Date().toLocaleTimeString() }
        : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('wecare_appointments_changed'));
    return updated;
  } catch {
    return getStoredAppointments();
  }
}

export function approveStoredAppointment(bookingId: string): StoredAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredAppointments();
    const updated = current.map((item) =>
      item.bookingId === bookingId
        ? {
            ...item,
            status: 'approved' as AppointmentStatus,
            approvedAt: new Date().toISOString(),
            lastUpdated: new Date().toLocaleTimeString(),
          }
        : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('wecare_appointments_changed'));

    // Sync status change to Firebase Firestore
    updateDoc(doc(db, 'appointments', bookingId), {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }).catch(() => {});

    return updated;
  } catch {
    return getStoredAppointments();
  }
}

export function rejectStoredAppointment(bookingId: string, reason?: string): StoredAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredAppointments();
    const updated = current.map((item) =>
      item.bookingId === bookingId
        ? {
            ...item,
            status: 'rejected' as AppointmentStatus,
            rejectionReason: reason || 'Declined by clinic administration.',
            rejectedAt: new Date().toISOString(),
            lastUpdated: new Date().toLocaleTimeString(),
          }
        : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('wecare_appointments_changed'));

    // Sync status change to Firebase Firestore
    updateDoc(doc(db, 'appointments', bookingId), {
      status: 'rejected',
      rejectionReason: reason || 'Declined by clinic administration.',
      rejectedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }).catch(() => {});

    return updated;
  } catch {
    return getStoredAppointments();
  }
}

export function cancelStoredAppointment(bookingId: string): StoredAppointment[] {
  return updateStoredAppointmentStatus(bookingId, 'cancelled');
}

export function deleteStoredAppointment(bookingId: string): StoredAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredAppointments();
    const updated = current.filter((item) => item.bookingId !== bookingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('wecare_appointments_changed'));

    // Sync deletion to Firebase Firestore
    deleteDoc(doc(db, 'appointments', bookingId)).catch(() => {
      // Graceful fallback
    });

    return updated;
  } catch {
    return getStoredAppointments();
  }
}

/**
 * Real-time or on-demand sync from Cloud Firestore 'appointments' collection.
 * Completely purges and ignores any fake/mock appointments.
 */
export async function syncAppointmentsFromFirestore(): Promise<StoredAppointment[]> {
  if (typeof window === 'undefined') return [];
  try {
    const snap = await getDocs(collection(db, 'appointments'));
    const local = getStoredAppointments();

    if (!snap.empty) {
      const remoteList: StoredAppointment[] = [];
      for (const d of snap.docs) {
        const data = d.data() as StoredAppointment;
        // If a mock appointment was previously stored in Firestore, permanently delete it
        if (isMockAppointment(data.bookingId) || isMockAppointment(d.id)) {
          deleteDoc(doc(db, 'appointments', d.id)).catch(() => {});
          continue;
        }
        if (data && data.bookingId) {
          remoteList.push(data);
        }
      }

      const remoteIds = new Set(remoteList.map((r) => r.bookingId));
      const cleanLocal = local.filter((l) => !isMockAppointment(l.bookingId));
      const merged = sortAppointmentsDescending([
        ...remoteList,
        ...cleanLocal.filter((l) => !remoteIds.has(l.bookingId)),
      ]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event('wecare_appointments_changed'));

      // Backfill any real local patient bookings to Firestore
      for (const loc of cleanLocal) {
        if (!remoteIds.has(loc.bookingId) && !isMockAppointment(loc.bookingId)) {
          setDoc(doc(db, 'appointments', loc.bookingId), {
            ...loc,
            syncedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      }
      return merged;
    } else if (local.length > 0) {
      // If Firestore is empty, backfill only real patient appointments into Cloud Firestore
      const cleanLocal = sortAppointmentsDescending(local.filter((l) => !isMockAppointment(l.bookingId)));
      for (const loc of cleanLocal) {
        setDoc(doc(db, 'appointments', loc.bookingId), {
          ...loc,
          syncedAt: new Date().toISOString(),
        }).catch(() => {});
      }
      return cleanLocal;
    }
  } catch (err: any) {
    console.warn('[Firebase Firestore] Remote sync notice:', err.message);
  }
  return getStoredAppointments();
}

export function getAppointmentCounts(list?: StoredAppointment[]) {
  const all = list || getStoredAppointments();
  const uniquePatients = new Set(all.map((a) => a.email ? a.email.toLowerCase().trim() : '')).size;
  return {
    total: all.length,
    pending: all.filter((a) => a.status === 'pending').length,
    approved: all.filter((a) => a.status === 'approved' || a.status === 'upcoming').length,
    rejected: all.filter((a) => a.status === 'rejected').length,
    upcoming: all.filter((a) => a.status === 'upcoming' || a.status === 'approved').length,
    completed: all.filter((a) => a.status === 'completed').length,
    cancelled: all.filter((a) => a.status === 'cancelled').length,
    telehealth: 0,
    inPerson: all.filter((a) => a.status !== 'cancelled' && a.status !== 'rejected').length,
    uniquePatients,
  };
}
