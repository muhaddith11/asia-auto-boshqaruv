'use client';
import { useEffect, useState } from 'react';
import type { Role, Section } from './auth';
import { canAccess, ROLES } from './auth';
import { useViewMode, type ViewMode } from '@/store/useViewMode';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

// Rol hech qachon tanlamagan bo'lsa ishlatiladigan standart ko'rinish.
function defaultViewFor(role: Role | null): ViewMode {
  return role === 'boshliq' ? 'compact' : 'full';
}

/**
 * Joriy foydalanuvchi rolini cookie'dan o'qiydi (client tomon).
 * `null` — hali aniqlanmagan (SSR/mount oldi).
 */
export function useRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);
  const { viewMode: storedView, setViewMode } = useViewMode();

  useEffect(() => {
    // Rol login paytida o'rnatiladigan auth_role cookie'dan o'qiladi (UI uchun).
    // Haqiqiy xavfsizlik imzolangan auth_session orqali serverda (proxy) ta'minlanadi.
    const r = readCookie('auth_role');
    setRole(r && (ROLES as string[]).includes(r) ? (r as Role) : null);
    setReady(true);
  }, []);

  // To'liq huquqli hisoblar (egasi/boshliq) ko'rinishni almashtira oladi — huquq
  // ikkalasida ham bir xil, farqi faqat interfeys qanchalik "ixcham" ko'rinishida.
  const canSwitchView = role === 'egasi' || role === 'boshliq';
  const viewMode: ViewMode = canSwitchView ? (storedView ?? defaultViewFor(role)) : 'full';

  return {
    role,
    ready,
    // Boshliqning ixcham ko'rinishi (hisob-kitob va buyurtmalar) — real rolidan
    // EMAS, joriy tanlangan ko'rinishdan kelib chiqadi (pastga qarang).
    boss: viewMode === 'compact',
    canSwitchView,
    viewMode,
    setViewMode,
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
