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
    // Rol login paytida o'rnatiladigan auth_role cookie'dan o'qiladi (UI uchun).
    // Haqiqiy xavfsizlik imzolangan auth_session orqali serverda (proxy) ta'minlanadi.
    const r = readCookie('auth_role');
    setRole(r && ['egasi', 'sherik', 'xodim'].includes(r) ? (r as Role) : null);
    setReady(true);
  }, []);

  return {
    role,
    ready,
    can: (section: Section) => canAccess(role, section),
  };
}

export async function logout() {
  try {
    // httpOnly sessiya cookie'sini faqat server o'chira oladi
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // e'tiborsiz — baribir /login ga o'tamiz
  }
  // UI cookie'larini ham tozalaymiz
  document.cookie = 'auth_role=; path=/; max-age=0';
  document.cookie = 'auth_name=; path=/; max-age=0';
  window.location.href = '/login';
}
