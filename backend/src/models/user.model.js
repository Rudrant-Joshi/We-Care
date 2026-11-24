/**
 * User Model
 */

export class User {
  constructor({
    id = 'usr_' + Math.random().toString(36).substring(2, 9),
    name,
    email,
    passwordHash = null,
    role = 'patient',
    phone = '',
    specialty = '',
    avatar = '',
    memberSince = new Date().toISOString(),
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.name = name;
    this.email = email ? email.toLowerCase().trim() : '';
    this.passwordHash = passwordHash;
    this.role = role;
    this.phone = phone;
    this.specialty = specialty;
    this.avatar = avatar;
    this.memberSince = memberSince;
    this.createdAt = createdAt;
  }

  toJSON() {
    const { passwordHash, ...safeUser } = this;
    return safeUser;
  }
}

export const inMemoryUsers = [
  new User({
    id: 'usr_admin_001',
    name: 'Rudrant Joshi',
    email: 'rudrant.joshi@gmail.com',
    role: 'admin',
    phone: '+1 (555) 019-2834',
    specialty: 'Chief Medical Administration',
    memberSince: '2025-01-01T00:00:00.000Z'
  }),
  new User({
    id: 'usr_doc_002',
    name: 'Dr. Scott Lang',
    email: 'scott.lang@wecare.health',
    role: 'doctor',
    phone: '+1 (555) 019-5412',
    specialty: 'Biomechanical Surgery & Nanomedicine',
    memberSince: '2025-03-15T00:00:00.000Z'
  }),
  new User({
    id: 'usr_pat_003',
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
    role: 'patient',
    phone: '+1 (555) 019-9941',
    memberSince: '2026-02-10T00:00:00.000Z'
  })
];

export default User;
