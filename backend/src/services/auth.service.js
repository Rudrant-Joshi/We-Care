/**
 * Backend Authentication Service
 */

import { User, inMemoryUsers } from '../models/user.model.js';

export class AuthService {
  static async login(email, password) {
    const cleanEmail = email.toLowerCase().trim();
    let user = inMemoryUsers.find(u => u.email === cleanEmail);

    if (!user) {
      // Auto-provision patient account if not registered yet
      const role = cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('doc') ? 'doctor' : 'patient';
      user = new User({
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role
      });
      inMemoryUsers.push(user);
    }

    const token = `wecare_token_${user.id}_${Date.now()}`;
    return { user: user.toJSON(), token };
  }

  static async register({ name, email, role = 'patient', phone = '', specialty = '' }) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = inMemoryUsers.find(u => u.email === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const user = new User({
      name,
      email: cleanEmail,
      role,
      phone,
      specialty
    });

    inMemoryUsers.push(user);
    const token = `wecare_token_${user.id}_${Date.now()}`;
    return { user: user.toJSON(), token };
  }

  static async getUserById(id) {
    const user = inMemoryUsers.find(u => u.id === id);
    return user ? user.toJSON() : null;
  }
}

export default AuthService;
