'use client';
import { useEffect, useState } from 'react';
import type { Role, Section } from './auth';
import { canAccess } from './auth';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Joriy foydalanuvchi rolini cookie'dan o'qiydi (client tomon).
 * `null` — hali aniqlanmagan (SSR/mount oldi).
 */
export function useRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const r = readCookie('auth_role');
    const session = readCookie('auth_session');
    if (r && ['egasi', 'sherik', 'xodim'].includes(r)) {
      setRole(r as Role);
    } else if (session) {
      // Eski sessiya (rol cookie'siz) = egasi. Yangidan login qilganda to'g'ri rol o'rnatiladi.
      setRole('egasi');
    } else {
      setRole(null);
    }
    setReady(true);
  }, []);

  return {
    role,
    ready,
    can: (section: Section) => canAccess(role, section),
  };
}

export function logout() {
  document.cookie = 'auth_session=; path=/; max-age=0';
  document.cookie = 'auth_role=; path=/; max-age=0';
  document.cookie = 'auth_name=; path=/; max-age=0';
  window.location.href = '/login';
}
