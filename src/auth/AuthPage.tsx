import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthSectionOne from '@/components/ui/auth-section-1';
import { useAuth } from './AuthContext';

/**
 * Strict OWASP Open-Redirect sanitizer (CWE-601).
 * Ensures redirection paths stay strictly within the local application routes.
 */
function sanitizeRedirectUrl(rawUrl: string | null): string {
  if (!rawUrl) return '/appointments';
  const trimmed = rawUrl.trim();
  // Must start with '/' but not '//', '\', or protocol schemes like 'javascript:', 'data:', 'https:'
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\') &&
    !trimmed.includes(':')
  ) {
    return trimmed;
  }
  return '/appointments';
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const initialMode = location.pathname === '/register' ? 'register' : 'login';
  const params = new URLSearchParams(location.search);
  const rawRedirect = params.get('redirect');
  const safeRedirect = sanitizeRedirectUrl(rawRedirect);
  const isBookingRedirect = rawRedirect ? rawRedirect.includes('book') : false;

  // If already authenticated as Chief Admin, directly open Admin Panel
  useEffect(() => {
    const isAdmin =
      currentUser?.role === 'admin' ||
      currentUser?.email?.toLowerCase() === 'rudrant.joshi@gmail.com' ||
      currentUser?.email?.toLowerCase().includes('admin');
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSuccess = (user?: any) => {
    let effectiveUser = user || currentUser;
    if (!effectiveUser) {
      try {
        const saved = localStorage.getItem('wecare_authenticated_user_v1');
        if (saved) effectiveUser = JSON.parse(saved);
      } catch {}
    }

    // When logging in as Admin: ALWAYS directly open Chief Admin Portal (/admin)
    const isAdmin =
      effectiveUser?.role === 'admin' ||
      effectiveUser?.email?.toLowerCase() === 'rudrant.joshi@gmail.com' ||
      effectiveUser?.email?.toLowerCase().includes('admin');

    if (isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    navigate(safeRedirect, { replace: true });
  };

  return (
    <AuthSectionOne
      initialMode={initialMode}
      redirectUrl={safeRedirect}
      isBookingRedirect={isBookingRedirect}
      onSuccess={handleSuccess}
      brandTitle={"Book Appointments,\nCare Faster"}
      brandSubtitle="Sign in to your verified patient account to book consultations, select specialists, and manage medical care."
    />
  );
}
