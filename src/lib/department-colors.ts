/**
 * Canonical Department Colors & Theme Design Tokens
 * 
 * SINGLE SOURCE OF TRUTH across the entire WeCare application:
 * - Departments Section (/departments)
 * - Doctors Section (/doctors)
 * - About Section (/about)
 * - Appointments & Book Appointment Sections (/appointments & /book-appointment)
 * 
 * Every department has exactly one persistent color identity.
 */

export interface DepartmentColorToken {
  id: string;
  name: string;
  badge: string;
  themeKey: string;
  gradientFrom: string;
  gradientTo: string;
  topAccent: string;
  iconBg: string;
  tagBadge: string;
  border: string;
  spotlight: string;
  glowColor: string;
  solid: string;
  cardBg: string;
}

export const DEPARTMENT_COLORS: Record<string, DepartmentColorToken> = {
  cardiology: {
    id: "cardiology",
    name: "Cardiology",
    badge: "Cardio",
    themeKey: "rose",
    gradientFrom: "#f43f5e",
    gradientTo: "#e11d48",
    topAccent: "from-rose-500 to-red-600",
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30",
    tagBadge: "bg-rose-50 text-rose-700 border-rose-200/80",
    border: "border-rose-200/90 hover:border-rose-400 hover:shadow-[0_20px_45px_rgba(244,63,94,0.18)]",
    spotlight: "rgba(244, 63, 94, 0.2)",
    glowColor: "bg-rose-400/20",
    solid: "text-rose-600",
    cardBg: "from-rose-500/10 via-white to-rose-50/40",
  },
  neurology: {
    id: "neurology",
    name: "Neurology",
    badge: "Neuro",
    themeKey: "violet",
    gradientFrom: "#8b5cf6",
    gradientTo: "#6366f1",
    topAccent: "from-violet-500 to-purple-600",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/30",
    tagBadge: "bg-violet-50 text-violet-700 border-violet-200/80",
    border: "border-violet-200/90 hover:border-violet-400 hover:shadow-[0_20px_45px_rgba(139,92,246,0.18)]",
    spotlight: "rgba(139, 92, 246, 0.2)",
    glowColor: "bg-violet-400/20",
    solid: "text-violet-600",
    cardBg: "from-violet-500/10 via-white to-purple-50/40",
  },
  orthopedics: {
    id: "orthopedics",
    name: "Orthopedics",
    badge: "Ortho",
    themeKey: "amber",
    gradientFrom: "#f59e0b",
    gradientTo: "#ea580c",
    topAccent: "from-amber-500 to-orange-600",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30",
    tagBadge: "bg-amber-50 text-amber-700 border-amber-200/80",
    border: "border-amber-200/90 hover:border-amber-400 hover:shadow-[0_20px_45px_rgba(245,158,11,0.18)]",
    spotlight: "rgba(245, 158, 11, 0.2)",
    glowColor: "bg-amber-400/20",
    solid: "text-amber-600",
    cardBg: "from-amber-500/10 via-white to-amber-50/40",
  },
  pediatrics: {
    id: "pediatrics",
    name: "Pediatrics",
    badge: "Peds",
    themeKey: "cyan",
    gradientFrom: "#06b6d4",
    gradientTo: "#0284c7",
    topAccent: "from-cyan-500 to-sky-600",
    iconBg: "bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/30",
    tagBadge: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
    border: "border-cyan-200/90 hover:border-cyan-400 hover:shadow-[0_20px_45px_rgba(6,182,212,0.18)]",
    spotlight: "rgba(6, 182, 212, 0.2)",
    glowColor: "bg-cyan-400/20",
    solid: "text-cyan-600",
    cardBg: "from-cyan-500/10 via-white to-sky-50/40",
  },
  oncology: {
    id: "oncology",
    name: "Oncology",
    badge: "Onco",
    themeKey: "emerald",
    gradientFrom: "#10b981",
    gradientTo: "#0d9488",
    topAccent: "from-emerald-500 to-teal-600",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30",
    tagBadge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    border: "border-emerald-200/90 hover:border-emerald-400 hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)]",
    spotlight: "rgba(16, 185, 129, 0.2)",
    glowColor: "bg-emerald-400/20",
    solid: "text-emerald-600",
    cardBg: "from-emerald-500/10 via-white to-emerald-50/40",
  },
  dermatology: {
    id: "dermatology",
    name: "Dermatology",
    badge: "Derma",
    themeKey: "pink",
    gradientFrom: "#ec4899",
    gradientTo: "#c026d3",
    topAccent: "from-pink-500 to-fuchsia-600",
    iconBg: "bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-md shadow-pink-500/30",
    tagBadge: "bg-pink-50 text-pink-700 border-pink-200/80",
    border: "border-pink-200/90 hover:border-pink-400 hover:shadow-[0_20px_45px_rgba(236,72,153,0.18)]",
    spotlight: "rgba(236, 72, 153, 0.2)",
    glowColor: "bg-pink-400/20",
    solid: "text-pink-600",
    cardBg: "from-pink-500/10 via-white to-fuchsia-50/40",
  },
  emergency: {
    id: "emergency",
    name: "Emergency & Trauma",
    badge: "Emergency",
    themeKey: "orange",
    gradientFrom: "#f97316",
    gradientTo: "#ef4444",
    topAccent: "from-orange-500 to-red-600",
    iconBg: "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/30",
    tagBadge: "bg-orange-50 text-orange-700 border-orange-200/80",
    border: "border-orange-200/90 hover:border-orange-400 hover:shadow-[0_20px_45px_rgba(249,115,22,0.18)]",
    spotlight: "rgba(249, 115, 22, 0.2)",
    glowColor: "bg-orange-400/20",
    solid: "text-orange-600",
    cardBg: "from-orange-500/10 via-white to-red-50/40",
  },
  radiology: {
    id: "radiology",
    name: "Radiology & Imaging",
    badge: "Imaging",
    themeKey: "blue",
    gradientFrom: "#3b82f6",
    gradientTo: "#1d4ed8",
    topAccent: "from-blue-600 to-indigo-700",
    iconBg: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/30",
    tagBadge: "bg-blue-50 text-blue-700 border-blue-200/80",
    border: "border-blue-200/90 hover:border-blue-400 hover:shadow-[0_20px_45px_rgba(37,99,235,0.18)]",
    spotlight: "rgba(37, 99, 235, 0.2)",
    glowColor: "bg-blue-400/20",
    solid: "text-blue-600",
    cardBg: "from-blue-500/10 via-white to-indigo-50/40",
  },
};

export function getDepartmentColor(deptId: string): DepartmentColorToken {
  return DEPARTMENT_COLORS[deptId] || DEPARTMENT_COLORS.cardiology;
}
