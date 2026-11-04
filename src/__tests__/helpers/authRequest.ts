import { NextRequest } from 'next/server';
import type { Role } from '@/lib/auth';
import { createSessionToken } from '@/lib/session';

type RequestOptions = ConstructorParameters<typeof NextRequest>[1];

const ROLES: Role[] = ['egasi', 'boshliq', 'sherik', 'xodim'];
const tokens = Object.fromEntries(
  await Promise.all(ROLES.map(async (role) => [role, await createSessionToken(role, role)])),
) as Record<Role, string>;

// Route testlari uchun: imzolangan sessiya cookie'si bilan so'rov (standart rol — egasi).
export function authedRequest(url: string, init: RequestOptions = {}, role: Role = 'egasi'): NextRequest {
  const headers = new Headers(init.headers);
  headers.set('cookie', `auth_session=${tokens[role]}`);
  return new NextRequest(url, { ...init, headers });
}
