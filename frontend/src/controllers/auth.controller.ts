/**
 * Authentication Controller
 * 
 * Orchestrates user sessions, authentication flows, role assignments,
 * and security state synchronization between UI views and Auth Service.
 */

import { authService } from '../services/auth.service';
import type { User, RegisterPayload, UserRole } from '../models/user.model';

export class AuthController {
  static getCurrentUser(): User | null {
    return authService.getCurrentUser();
  }

  static isAuthenticated(): boolean {
    return !!authService.getCurrentUser();
  }

  static isAdmin(): boolean {
    const user = authService.getCurrentUser();
    if (!user) return false;
    return (
      user.role === 'admin' ||
      user.email.toLowerCase() === 'rudrant.joshi@gmail.com' ||
      user.email.toLowerCase().includes('admin')
    );
  }

  static async handleLogin(email: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    try {
      const user = await authService.login(email, password);
      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please verify credentials.' };
    }
  }

  static async handleRegister(payload: RegisterPayload): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!payload.email || !payload.email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!payload.name || payload.name.trim().length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }
    try {
      const user = await authService.register(payload);
      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }

  static async handleLogout(): Promise<void> {
    await authService.logout();
  }

  static getEffectiveRole(): UserRole {
    const user = authService.getCurrentUser();
    return user ? user.role : 'patient';
  }
}

export default AuthController;
