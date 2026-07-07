import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── In-memory cache (5 daqiqa TTL) ──────────────────────────────────────────
// Har safar Supabase'dan yuklamaslik uchun serverda saqlanadi.
// Vercel warm instance bo'lsa, repeat so'rovlar ~5ms da javob beradi.
let _cache: { data: string; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 daqiqa

// Known brand names with special casing (acronyms, hyphens, etc.)
const BRAND_ALIASES: Record<string, string> = {
  'bmw': 'BMW',
  'byd': 'BYD',
  'gwm': 'GWM',
  'mg': 'MG',
  'mercedes-benz': 'Mercedes-Benz',
};

function toProperCase(str: string) {
  if (!str) return '';

  const homoglyphs: Record<string, string> = {
    'е': 'e', 'а': 'a', 'о': 'o', 'с': 'c', 'р': 'p', 'х': 'x',
    'Е': 'E', 'А': 'A', 'О': 'O', 'С': 'C', 'Р': 'P', 'Х': 'X'
  };

  let clean = str.replace(/[еаосрхЕАОСРХ]/g, m => homoglyphs[m] || m);
  clean = clean.replace(/Chevolet/gi, 'Chevrolet');
  clean = clean.replace(/[  ᠎ -​  　﻿]/g, ' ').trim();

  if (!clean) return '';
  const result = clean.split(' ').filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const alias = BRAND_ALIASES[result.toLowerCase()];
  return alias || result;
}

async function buildCatalog() {
  // ── Parallel fetch: cars + all service pages at once ────────────────────
  const PAGE = 1000;
  // Biz 3330+ xizmat borligini bilamiz, 5 ta page parallel yuklaymiz
  const pageCount = 5;

  const [carsResult, ...serviceChunks] = await Promise.all([
    supabase.from('cars_list').select('brand, name').range(0, 5000).order('brand', { ascending: true }),
    ...Array.from({ length: pageCount }, (_, i) =>
      supabase.from('services_list')
        .select('brand, car_model, name, price')
        .order('id', { ascending: true })
        .range(i * PAGE, (i + 1) * PAGE - 1)
    ),
  ]);

  if (carsResult.error) throw carsResult.error;

  const cars = carsResult.data ?? [];
  const services: any[] = [];
  for (const chunk of serviceChunks) {
    if (chunk.error) throw chunk.error;
    if (chunk.data) services.push(...chunk.data);
  }

  // ── Build catalog ────────────────────────────────────────────────────────
  const normalizedCatalog: any = {};
  const brandsSet = new Set<string>();

  services.forEach((s: any) => {
    if (!s.brand || s.brand.toUpperCase() === 'UMUMIY') return;
    const b = toProperCase(s.brand || 'Boshqa');
    const m = toProperCase(s.car_model || 'Umumiy');
    if (!normalizedCatalog[b]) normalizedCatalog[b] = {};
    if (!normalizedCatalog[b][m]) normalizedCatalog[b][m] = [];
    const existingIdx = normalizedCatalog[b][m].findIndex((e: any) =>
      e.name.trim().toUpperCase() === s.name.trim().toUpperCase()
    );
    if (existingIdx >= 0) {
      normalizedCatalog[b][m][existingIdx] = { name: s.name, price: s.price };
    } else {
      normalizedCatalog[b][m].push({ name: s.name, price: s.price });
    }
    brandsSet.add(b);
  });

  cars.forEach((c: any) => {
    if (!c.brand || c.brand.toUpperCase() === 'UMUMIY') return;
    const b = toProperCase(c.brand);
    const m = toProperCase(c.name);
    brandsSet.add(b);
    if (!normalizedCatalog[b]) normalizedCatalog[b] = {};
    if (!normalizedCatalog[b][m]) normalizedCatalog[b][m] = [];
  });

  const finalCatalog: any = {};
  const finalBrands = Array.from(brandsSet).sort();

  finalBrands.forEach(b => {
    if (!normalizedCatalog[b]) return;
    const models = Object.keys(normalizedCatalog[b]);
    const brandObj: any = {};
    models.forEach(m => {
      if (normalizedCatalog[b][m]?.length > 0) brandObj[m] = normalizedCatalog[b][m];
    });
    if (Object.keys(brandObj).length === 0) models.forEach(m => (brandObj[m] = []));
    finalCatalog[b] = brandObj;
  });

  return JSON.stringify({
    version: 'v14_cached',
    count: { raw_cars: cars.length, raw_services: services.length },
    brands: finalBrands,
    catalog: finalCatalog,
  });
}

export async function GET() {
  try {
    if (!supabase) throw new Error("Supabase ulanishi mavjud emas.");

    const now = Date.now();

    // Cache hit — Supabase'ga so'rov yo'q, darhol javob
    if (_cache && now - _cache.ts < CACHE_TTL_MS) {
      return new NextResponse(_cache.data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Cache miss — Supabase'dan yuklab cache ga yozamiz
    const json = await buildCatalog();
    _cache = { data: json, ts: now };

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error: any) {
    console.error('❌ Bot Catalog API Error:', error);
    return NextResponse.json({ error: error.message, catalog: {}, brands: [] }, { status: 500 });
  }
}

// ── Cache tozalash uchun (xizmat qo'shilganda chaqirish mumkin) ─────────────
export function invalidateCatalogCache() {
  _cache = null;
}
