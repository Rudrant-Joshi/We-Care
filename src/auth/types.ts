export type UserRole = 'patient' | 'doctor' | 'caregiver' | 'admin';

export type AuthMode = 'login' | 'register';

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  specialty?: string;
  memberSince?: string;
  badgeNumber?: string;
  isFirebase?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  specialty?: string;
}

export interface RoleConfig {
  id: UserRole;
  title: string;
  tagline: string;
  iconName: 'User' | 'Stethoscope' | 'ShieldCheck' | 'ShieldAlert';
  primaryColor: string;
  accentGradient: string;
  glowColor: string;
  badgeBg: string;
  securityClearance: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  patient: {
    id: 'patient',
    title: 'Patient Portal',
    tagline: 'Access records, appointments & personal care telemetry',
    iconName: 'User',
    primaryColor: '#38BDF8',
    accentGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    badgeBg: 'bg-sky-500/15 border-sky-400/30 text-sky-300',
    securityClearance: 'PATIENT-ID // LEVEL 1 PASS',
  },
  doctor: {
    id: 'doctor',
    title: 'Physician / Specialist',
    tagline: 'Clinical diagnostics, EHR access & patient triage station',
    iconName: 'Stethoscope',
    primaryColor: '#34D399',
    accentGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    badgeBg: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
    securityClearance: 'MD-BOARD // ENCRYPTED ACCESS',
  },
  caregiver: {
    id: 'caregiver',
    title: 'Caregiver & Family',
    tagline: 'Guardian oversight, shared telemetry & emergency alerts',
    iconName: 'ShieldCheck',
    primaryColor: '#C084FC',
    accentGradient: 'from-purple-400 via-fuchsia-500 to-rose-500',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    badgeBg: 'bg-purple-500/15 border-purple-400/30 text-purple-300',
    securityClearance: 'GUARDIAN-LINK // VERIFIED ACCESS',
  },
  admin: {
    id: 'admin',
    title: 'Chief Admin Console',
    tagline: 'System-wide patient triage, clinical appointments & telemetry oversight',
    iconName: 'ShieldAlert',
    primaryColor: '#8B5CF6',
    accentGradient: 'from-violet-500 via-purple-600 to-indigo-700',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    badgeBg: 'bg-violet-500/15 border-violet-400/30 text-violet-300',
    securityClearance: 'CHIEF-ADMIN // ROOT CLEARANCE',
  },
};
