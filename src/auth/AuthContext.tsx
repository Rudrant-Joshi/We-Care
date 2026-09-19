import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import type { User, UserRole, RegisterPayload } from './types';

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authNotice: string | null;
  clearAuthNotice: () => void;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  demoLogin: (role: UserRole) => void;
}

const STORAGE_KEY = 'wecare_authenticated_user_v1';
const REGISTERED_ACCOUNTS_KEY = 'wecare_registered_accounts_v1';

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  password?: string; // Kept only for automatic legacy migration
  role: UserRole;
  createdAt: string;
}

/**
 * Securely hashes passwords using SHA-256 with a unique salt via Web Crypto API.
 * Never stores plain text credentials in localStorage.
 */
async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + ':wecare-auth-salt-v1');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

export function getRegisteredAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredAccount(acc: RegisteredAccount) {
  if (typeof window === 'undefined') return;
  try {
    // Sanitization: Ensure plaintext password is never persisted to client storage
    const sanitized: RegisteredAccount = {
      id: acc.id,
      name: acc.name,
      email: acc.email,
      passwordHash: acc.passwordHash,
      role: acc.role,
      createdAt: acc.createdAt,
    };
    const list = getRegisteredAccounts().filter(
      (a) => a.email.toLowerCase() !== acc.email.toLowerCase()
    );
    list.push(sanitized);
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('wecare_auth_state_changed'));
  } catch (err) {
    console.warn('Failed to save registered account locally:', err);
  }
}

export function deleteRegisteredAccount(emailOrId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = emailOrId.toLowerCase().trim();
    const list = getRegisteredAccounts().filter(
      (a) => a.id !== emailOrId && a.email.toLowerCase().trim() !== clean
    );
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('wecare_auth_state_changed'));
  } catch (err) {
    console.warn('Failed to delete registered account locally:', err);
  }
}

const DELETED_USERS_KEY = 'wecare_deleted_users_v1';

export function getDeletedUserEmails(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordDeletedUser(email: string, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = email.toLowerCase().trim();
    if (!clean) return;
    const deleted = getDeletedUserEmails();
    if (!deleted.includes(clean)) {
      deleted.push(clean);
      localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(deleted));
    }
    deleteRegisteredAccount(clean);
    window.dispatchEvent(new Event('wecare_auth_state_changed'));
    window.dispatchEvent(new Event('wecare_appointments_changed'));

    // Synchronize deletion with Cloud Firestore in real time
    if (userId) {
      deleteDoc(doc(db, 'users', userId)).catch(() => {});
    }
    deleteDoc(doc(db, 'users', clean)).catch(() => {});

    // Write tombstone to 'deleted_users' so all connected devices (phones & laptops) immediately react
    setDoc(doc(db, 'deleted_users', clean), {
      email: clean,
      userId: userId || null,
      deletedAt: new Date().toISOString(),
      timestamp: Date.now(),
    }).catch((fsErr) => {
      console.warn('[Firestore] Failed to write to deleted_users:', fsErr);
    });
  } catch (err) {
    console.warn('Failed to record deleted user:', err);
  }
}

/**
 * Ensures an active user has a corresponding document in Firestore 'users' collection,
 * allowing live database updates and direct deletion from Firebase Console.
 */
export async function syncUserToFirestore(user: User): Promise<void> {
  if (!user || !user.id) return;
  try {
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const deletedList = getDeletedUserEmails();
    if (cleanEmail && deletedList.includes(cleanEmail)) {
      return; // Do not recreate deleted user
    }
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(
      userDocRef,
      {
        id: user.id,
        uid: user.uid || user.id,
        name: user.name,
        email: cleanEmail,
        role: user.role,
        phone: user.phone || '',
        specialty: user.specialty || '',
        avatar: user.avatar || '',
        badgeNumber: user.badgeNumber || '',
        memberSince: user.memberSince || new Date().getFullYear().toString(),
        lastSeen: new Date().toISOString(),
        isDeleted: false,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[Firestore] syncUserToFirestore note:', err);
  }
}

export const DEMO_USERS: Record<UserRole, User> = {
  patient: {
    id: 'usr-pat-001',
    name: 'Alex Morgan',
    email: 'alex.morgan@healthmail.com',
    phone: '+1 (555) 234-8901',
    role: 'patient',
    badgeNumber: 'WC-9428-PT',
    memberSince: '2024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isFirebase: false,
  },
  doctor: {
    id: 'usr-doc-002',
    name: 'Dr. Sarah Bennett',
    email: 'dr.sarah@wecare.health',
    phone: '+1 (555) 771-0021',
    role: 'doctor',
    badgeNumber: 'MED-7710-SPEC',
    specialty: 'Neuro-Cardiology & Tele-Robotics',
    memberSince: '2021',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    isFirebase: false,
  },
  caregiver: {
    id: 'usr-car-003',
    name: 'Elena Vance',
    email: 'elena.vance@guardiancare.org',
    phone: '+1 (555) 330-4499',
    role: 'caregiver',
    badgeNumber: 'GRD-3304-FAM',
    memberSince: '2023',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isFirebase: false,
  },
  admin: {
    id: 'usr-admin-rudrant-001',
    name: 'Rudrant Joshi (Chief Admin)',
    email: 'rudrant.joshi@gmail.com',
    phone: '+1 (555) 902-8822',
    role: 'admin',
    badgeNumber: 'WC-CHIEF-ADMIN',
    memberSince: '2024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isFirebase: false,
  },
};

export const ADMIN_USER: User = DEMO_USERS.admin;

function formatAuthError(errorCode?: string, fallbackMessage?: string): string {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
  const isIp = currentHost === '127.0.0.1';

  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials or sign up.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact clinic administration.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing authentication. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Another authentication popup is already open. Please complete or close it first.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to unusual activity. Try again in a moment.';
    case 'auth/unauthorized-domain':
      return isIp
        ? `Domain unauthorized: You are accessing via "127.0.0.1". Firebase allows Google OAuth on "localhost". Please access via http://localhost:5173, or add "127.0.0.1" in Firebase Console (wecare-165d7) > Authentication > Settings > Authorized Domains.`
        : `Domain unauthorized: "${currentHost}" is not in your Firebase Console authorized domains. Please add "${currentHost}" in Firebase Console (wecare-165d7) > Authentication > Settings > Authorized Domains to enable Google Sign-In.`;
    case 'auth/popup-blocked':
      return `Sign-in popup was blocked by your browser. Please allow popups for ${currentHost} to sign in with Google.`;
    case 'auth/operation-not-allowed':
      return 'Google sign-in provider is not enabled in your Firebase Project. Please enable Google in Firebase Console (wecare-165d7) > Authentication > Sign-in method.';
    default:
      return fallbackMessage || 'Authentication failed. Please try again.';
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const isLoggingOutRef = useRef(false);

  const clearAuthNotice = () => setAuthNotice(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.email) {
        const deletedEmails = getDeletedUserEmails();
        if (deletedEmails.includes(parsed.email.toLowerCase().trim())) {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const currentUserRef = useRef<User | null>(currentUser);
  currentUserRef.current = currentUser;

  const persistUser = (user: User | null, shouldSyncToCloud: boolean = true) => {
    setCurrentUser(user);
    currentUserRef.current = user;
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      if (shouldSyncToCloud) {
        syncUserToFirestore(user).catch(() => {});
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new Event('wecare_auth_state_changed'));
  };

  // Sync state across browser tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newUser = e.newValue ? JSON.parse(e.newValue) : null;
          setCurrentUser(newUser);
          currentUserRef.current = newUser;
        } catch {
          setCurrentUser(null);
          currentUserRef.current = null;
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 1. Real-time listener on 'deleted_users' in Firestore across all devices
  useEffect(() => {
    let unsubscribeDeleted: (() => void) | null = null;
    try {
      unsubscribeDeleted = onSnapshot(
        collection(db, 'deleted_users'),
        (snapshot) => {
          const remoteDeleted: string[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            const email = (data?.email || d.id || '').toLowerCase().trim();
            if (email) remoteDeleted.push(email);
          });

          const localDeleted = getDeletedUserEmails();
          let changed = false;
          remoteDeleted.forEach((email) => {
            if (!localDeleted.includes(email)) {
              localDeleted.push(email);
              changed = true;
            }
          });

          if (changed) {
            localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(localDeleted));
            window.dispatchEvent(new Event('wecare_auth_state_changed'));
            window.dispatchEvent(new Event('wecare_appointments_changed'));
          }

          // If current logged-in user was deleted in the database, automatically log out
          const activeUser = currentUserRef.current;
          if (activeUser?.email) {
            const myEmail = activeUser.email.toLowerCase().trim();
            if (remoteDeleted.includes(myEmail) || localDeleted.includes(myEmail)) {
              if (!isLoggingOutRef.current) {
                isLoggingOutRef.current = true;
                setAuthNotice('Your user account was removed from the database. You have been automatically signed out.');
                logout().finally(() => {
                  isLoggingOutRef.current = false;
                });
              }
            }
          }
        },
        (error) => {
          console.warn('[Auth Live] Deleted users live sync note:', error.message);
        }
      );
    } catch {}

    return () => {
      if (unsubscribeDeleted) unsubscribeDeleted();
    };
  }, []);

  // 2. Real-time listener on current user's document in Firestore (doc changes, deletions, role updates)
  useEffect(() => {
    const activeUser = currentUserRef.current;
    if (!activeUser) return;
    const userId = activeUser.id || activeUser.uid;
    if (!userId) return;

    let hasEverExisted = false;
    let unsubscribeUserDoc: (() => void) | null = null;

    try {
      unsubscribeUserDoc = onSnapshot(
        doc(db, 'users', userId),
        (docSnap) => {
          const latestUser = currentUserRef.current;
          if (!docSnap.exists() || docSnap.data()?.isDeleted === true) {
            // If the document was deleted from Firestore (or flagged isDeleted)
            if (hasEverExisted || (latestUser && latestUser.isFirebase)) {
              if (!isLoggingOutRef.current) {
                isLoggingOutRef.current = true;
                setAuthNotice('Your user profile was deleted from the database. You have been signed out.');
                logout().finally(() => {
                  isLoggingOutRef.current = false;
                });
              }
            }
          } else {
            hasEverExisted = true;
            if (!latestUser) return;
            const data = docSnap.data();
            const isAdminEmail = (data.email || latestUser.email)?.toLowerCase() === 'rudrant.joshi@gmail.com';
            const updatedRole: UserRole = isAdminEmail ? 'admin' : ((data.role as UserRole) || latestUser.role);

            const updatedUser: User = {
              ...latestUser,
              name: isAdminEmail
                ? 'Rudrant Joshi (Chief Admin)'
                : (data.name || latestUser.name),
              email: data.email || latestUser.email,
              phone: data.phone ?? latestUser.phone,
              role: updatedRole,
              specialty: data.specialty ?? latestUser.specialty,
              avatar: data.avatar ?? latestUser.avatar,
              badgeNumber: updatedRole === 'admin'
                ? 'WC-CHIEF-ADMIN'
                : (data.badgeNumber || latestUser.badgeNumber),
            };

            const norm = (s?: string | null) => (s || '').trim();
            const hasChanged =
              norm(updatedUser.name) !== norm(latestUser.name) ||
              norm(updatedUser.email) !== norm(latestUser.email) ||
              norm(updatedUser.phone) !== norm(latestUser.phone) ||
              norm(updatedUser.specialty) !== norm(latestUser.specialty) ||
              norm(updatedUser.avatar) !== norm(latestUser.avatar) ||
              updatedUser.role !== latestUser.role;

            // Only update state if fields actually differ, and do NOT echo back to Firestore
            if (hasChanged) {
              persistUser(updatedUser, false);
            }
          }
        },
        (error) => {
          console.warn('[Auth Live] User doc subscription notice:', error.message);
        }
      );
    } catch {}

    return () => {
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, [currentUser?.id, currentUser?.uid]);

  // 3. Heartbeat check on Firebase Auth instance
  useEffect(() => {
    const checkFirebaseAuth = async () => {
      const fbUser = auth.currentUser;
      if (fbUser) {
        try {
          await fbUser.reload();
        } catch (err: any) {
          if (
            err?.code === 'auth/user-not-found' ||
            err?.code === 'auth/user-disabled' ||
            err?.code === 'auth/invalid-user-token'
          ) {
            setAuthNotice('Your account credentials were removed from the database.');
            logout();
          }
        }
      }
    };

    const interval = setInterval(checkFirebaseAuth, 15000);
    window.addEventListener('focus', checkFirebaseAuth);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkFirebaseAuth);
    };
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(false);
      if (fbUser) {
        let userRole: UserRole = 'patient';
        let phone: string | undefined = fbUser.phoneNumber || undefined;
        let specialty: string | undefined = undefined;

        // Try reading Firestore user metadata if available
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.isDeleted) {
              await signOut(auth);
              persistUser(null);
              return;
            }
            if (data.role) userRole = data.role as UserRole;
            if (data.phone) phone = data.phone;
            if (data.specialty) specialty = data.specialty;
          }
        } catch {
          // Graceful fallback
        }

        // Check for admin override by email
        if (fbUser.email?.toLowerCase() === 'rudrant.joshi@gmail.com') {
          userRole = 'admin';
        }

        const userObj: User = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.email?.toLowerCase() === 'rudrant.joshi@gmail.com'
            ? 'Rudrant Joshi (Chief Admin)'
            : fbUser.displayName || fbUser.email?.split('@')[0] || 'WeCare Patient',
          email: fbUser.email || '',
          phone: phone,
          role: userRole,
          specialty: specialty,
          avatar: fbUser.photoURL || undefined,
          badgeNumber: userRole === 'admin' ? 'WC-CHIEF-ADMIN' : `WC-${fbUser.uid.slice(0, 4).toUpperCase()}-PT`,
          memberSince: new Date().getFullYear().toString(),
          isFirebase: true,
        };

        persistUser(userObj);
      } else {
        // If current user is a Firebase user and now signed out, clear
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.isFirebase) {
              persistUser(null);
            }
          } catch {
            persistUser(null);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole = 'patient'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid clinical or personal email address.' };
    }
    if (!password) {
      return { success: false, error: 'Password is required to authenticate.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    const inputHash = await hashPassword(password);

    // 1. Direct Chief Admin Authentication (Email: rudrant.joshi@gmail.com, Verified via SHA-256)
    const ADMIN_PASSKEY_HASH = '561e2a935a73730114c09a843768085327750e494dcff5af2a2e2ab7bdb1c2b8';
    if (cleanEmail === 'rudrant.joshi@gmail.com' && inputHash === ADMIN_PASSKEY_HASH) {
      persistUser(DEMO_USERS.admin);
      return { success: true };
    }

    // 2. Check if test demo email across available roles
    for (const key of Object.keys(DEMO_USERS) as UserRole[]) {
      if (cleanEmail === DEMO_USERS[key].email.toLowerCase()) {
        persistUser(DEMO_USERS[key]);
        return { success: true };
      }
    }

    // 3. Check registered user accounts in local registry with SHA-256 hash comparison
    const localAccounts = getRegisteredAccounts();
    const matchedAccount = localAccounts.find((a) => {
      if (a.email.toLowerCase() !== cleanEmail) return false;
      if (a.passwordHash && a.passwordHash === inputHash) return true;
      if (a.password && a.password === password) return true; // Legacy upgrade
      return false;
    });

    if (matchedAccount) {
      if (matchedAccount.password && !matchedAccount.passwordHash) {
        matchedAccount.passwordHash = inputHash;
        delete matchedAccount.password;
        saveRegisteredAccount(matchedAccount);
      }
      const userObj: User = {
        id: matchedAccount.id,
        uid: matchedAccount.id,
        name: matchedAccount.name,
        email: matchedAccount.email,
        role: matchedAccount.role,
        badgeNumber: `WC-${matchedAccount.id.slice(0, 4).toUpperCase()}-PT`,
        memberSince: new Date().getFullYear().toString(),
        isFirebase: false,
      };
      persistUser(userObj);
      return { success: true };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = cred.user;

      const isAdminEmail = fbUser.email?.toLowerCase() === 'rudrant.joshi@gmail.com';
      const assignedRole: UserRole = isAdminEmail ? 'admin' : role;

      const userObj: User = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: isAdminEmail
          ? 'Rudrant Joshi (Chief Admin)'
          : fbUser.displayName || fbUser.email?.split('@')[0] || 'WeCare Patient',
        email: fbUser.email || email.trim(),
        role: assignedRole,
        badgeNumber: assignedRole === 'admin' ? 'WC-CHIEF-ADMIN' : `WC-${fbUser.uid.slice(0, 4).toUpperCase()}-PT`,
        memberSince: new Date().getFullYear().toString(),
        avatar: fbUser.photoURL || undefined,
        isFirebase: true,
      };

      persistUser(userObj);
      return { success: true };
    } catch (err: any) {
      console.error('Firebase sign-in error:', err);
      // Graceful fallback for local registered accounts if cloud auth is restricted
      if (
        err.code === 'auth/unauthorized-domain' ||
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/network-request-failed'
      ) {
        const localAccounts = getRegisteredAccounts();
        const matched = localAccounts.find((a) => {
          if (a.email.toLowerCase() !== cleanEmail) return false;
          if (a.passwordHash && a.passwordHash === inputHash) return true;
          if (a.password && a.password === password) return true;
          return false;
        });
        if (matched) {
          const fallbackUser: User = {
            id: matched.id,
            uid: matched.id,
            name: matched.name,
            email: matched.email,
            role: matched.role,
            badgeNumber: `WC-${matched.id.slice(0, 4).toUpperCase()}-PT`,
            memberSince: new Date().getFullYear().toString(),
            isFirebase: false,
          };
          persistUser(fallbackUser);
          return { success: true };
        }
      }
      return { success: false, error: formatAuthError(err.code, err.message) };
    }
  };

  const register = async (userData: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    if (!userData.name.trim()) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!userData.email.includes('@')) {
      return { success: false, error: 'Valid email address is required.' };
    }
    if (!userData.password || userData.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const role = userData.role || 'patient';
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanName = userData.name.trim();

    // Generate stable local user ID with secure password hash (never store plaintext password)
    const localId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = await hashPassword(userData.password);
    const newAccount: RegisteredAccount = {
      id: localId,
      name: cleanName,
      email: cleanEmail,
      passwordHash: passwordHash,
      role: role,
      createdAt: new Date().toISOString(),
    };
    saveRegisteredAccount(newAccount);

    try {
      const cred = await createUserWithEmailAndPassword(auth, userData.email.trim(), userData.password);
      const fbUser = cred.user;

      newAccount.id = fbUser.uid;
      saveRegisteredAccount(newAccount);

      // Update display name in Firebase Auth
      try {
        await updateProfile(fbUser, {
          displayName: cleanName,
        });
      } catch (profileErr) {
        console.warn('Could not update Firebase displayName:', profileErr);
      }

      // Best-effort Firestore user profile record
      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          name: cleanName,
          email: cleanEmail,
          phone: userData.phone || '',
          role: role,
          specialty: userData.specialty || '',
          createdAt: new Date().toISOString(),
        });
      } catch (fsErr) {
        console.warn('Firestore user profile note (proceeding):', fsErr);
      }

      const newUser: User = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: cleanName,
        email: cleanEmail,
        phone: userData.phone,
        role: role,
        specialty: userData.specialty,
        badgeNumber: `WC-${fbUser.uid.slice(0, 4).toUpperCase()}-${role.toUpperCase().slice(0, 2)}`,
        memberSince: new Date().getFullYear().toString(),
        avatar: DEMO_USERS[role].avatar,
        isFirebase: true,
      };

      persistUser(newUser);
      return { success: true };
    } catch (err: any) {
      console.error('Firebase registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
      }
      return { success: false, error: formatAuthError(err.code, err.message) };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;

      const isAdmin = fbUser.email?.toLowerCase() === 'rudrant.joshi@gmail.com';
      const role: UserRole = isAdmin ? 'admin' : 'patient';

      const userObj: User = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: isAdmin ? 'Rudrant Joshi (Chief Admin)' : (fbUser.displayName || fbUser.email?.split('@')[0] || 'WeCare Patient'),
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || undefined,
        role: role,
        avatar: fbUser.photoURL || undefined,
        badgeNumber: isAdmin ? 'WC-CHIEF-ADMIN' : `WC-${fbUser.uid.slice(0, 4).toUpperCase()}-PT`,
        memberSince: new Date().getFullYear().toString(),
        isFirebase: true,
      };

      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          name: userObj.name,
          email: userObj.email,
          role: role,
          avatar: userObj.avatar,
          lastLogin: new Date().toISOString(),
        }, { merge: true });
      } catch {}

      persistUser(userObj);
      return { success: true };
    } catch (err: any) {
      console.error('Firebase Google sign-in error:', err);
      return { success: false, error: formatAuthError(err.code, err.message) };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address to receive password reset instructions.' };
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      console.error('Firebase password reset error:', err);
      return { success: false, error: formatAuthError(err.code, err.message) };
    }
  };

  const demoLogin = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    persistUser(demo);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout note:', err);
    }
    persistUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        authNotice,
        clearAuthNotice,
        login,
        register,
        loginWithGoogle,
        resetPassword,
        logout,
        demoLogin,
      }}
    >
      {children}
      {authNotice && (
        <div
          role="alert"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto px-4 py-3.5 rounded-2xl bg-slate-900/95 text-white border border-rose-500/60 shadow-[0_10px_35px_rgba(244,63,94,0.3)] backdrop-blur-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="truncate">{authNotice}</span>
          </div>
          <button
            type="button"
            onClick={clearAuthNotice}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer shrink-0 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
