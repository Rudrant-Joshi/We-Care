/**
 * Authentication Service
 * 
 * Provides login, registration, role management, and session token storage.
 */

import { auth } from './firebase.service';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import type { User, UserRole, RegisterPayload } from '../models/user.model';
import api from './api.service';

const TOKEN_KEY = 'wecare_auth_token';
const CURRENT_USER_KEY = 'wecare_current_user_v2';

export const authService = {
  getCurrentToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  async login(email: string, password?: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();

    // Try Firebase Authentication if available
    if (password && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = cred.user;
        const user: User = {
          id: fbUser.uid,
          uid: fbUser.uid,
          email: fbUser.email || cleanEmail,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          role: cleanEmail.includes('admin') || cleanEmail === 'rudrant.joshi@gmail.com' ? 'admin' : 'patient',
          isFirebase: true
        };
        this.setCurrentUser(user);
        return user;
      } catch (err) {
        console.warn('Firebase login failed, falling back to local auth:', err);
      }
    }

    // Local / Backend login fallback
    const role: UserRole =
      cleanEmail.includes('admin') || cleanEmail === 'rudrant.joshi@gmail.com'
        ? 'admin'
        : cleanEmail.includes('doc')
        ? 'doctor'
        : cleanEmail.includes('care')
        ? 'caregiver'
        : 'patient';

    const user: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role,
      memberSince: new Date().toISOString()
    };

    this.setCurrentUser(user);
    return user;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const cleanEmail = payload.email.trim().toLowerCase();

    if (payload.password && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, payload.password);
        if (cred.user && payload.name) {
          await updateProfile(cred.user, { displayName: payload.name });
        }
      } catch (err) {
        console.warn('Firebase registration failed, continuing locally:', err);
      }
    }

    const user: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: payload.name,
      email: cleanEmail,
      phone: payload.phone,
      role: payload.role || 'patient',
      specialty: payload.specialty,
      memberSince: new Date().toISOString()
    };

    this.setCurrentUser(user);
    return user;
  },

  async logout(): Promise<void> {
    this.removeToken();
    this.setCurrentUser(null);
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error('Firebase signout error:', err);
      }
    }
  }
};

export default authService;
