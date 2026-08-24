import { describe, it, expect } from 'vitest';
import { normalizeServiceName, NormLookup, splitMashina } from '@/lib/points/norms';

describe('normalizeServiceName', () => {
  it('emoji va ortiqcha bo\'shliqni olib tashlaydi', () => {
    // Bazadagi haqiqiy variantlar — hammasi bitta kalitga tushishi kerak.
    expect(normalizeServiceName('💉 Injector tozalash')).toBe('injector tozalash');
    expect(normalizeServiceName('Injector tozalash')).toBe('injector tozalash');
    expect(normalizeServiceName('  INJECTOR   TOZALASH  ')).toBe('injector tozalash');
    expect(normalizeServiceName('🔍 Diagnostika')).toBe('diagnostika');
    expect(normalizeServiceName('Diagnostika ')).toBe('diagnostika');
  });

  it('k/c farqini ATAYLAB saqlaydi — turli xizmatlarni qo\'shib yubormaslik uchun', () => {
    expect(normalizeServiceName('Injektor tozalash')).not.toBe(normalizeServiceName('Injector tozalash'));
  });

  it('bo\'sh/null — bo\'sh satr', () => {
    expect(normalizeServiceName(null)).toBe('');
    expect(normalizeServiceName('   ')).toBe('');
    expect(normalizeServiceName('🔧')).toBe('');
  });
});

describe('NormLookup', () => {
  const norms = [
    { nom_norm: 'injector tozalash', brand: null, car_model: null, norma_daqiqa: 60 },
    { nom_norm: 'injector tozalash', brand: 'Chevrolet', car_model: null, norma_daqiqa: 50 },
    { nom_norm: 'injector tozalash', brand: 'Chevrolet', car_model: 'Gentra', norma_daqiqa: 45 },
    { nom_norm: 'svechalarni almashtirish', brand: null, car_model: null, norma_daqiqa: 20 },
  ];
  const lookup = new NormLookup(norms);

  it('eng aniq moslik ustun: model → brand → umumiy', () => {
    expect(lookup.find('💉 Injector tozalash', 'Chevrolet', 'Gentra')).toBe(45);
    expect(lookup.find('💉 Injector tozalash', 'Chevrolet', 'Malibu')).toBe(50);
    expect(lookup.find('💉 Injector tozalash', 'Kia', 'Rio')).toBe(60);
    expect(lookup.find('💉 Injector tozalash')).toBe(60);
  });

  it('normasi yo\'q xizmat — null', () => {
    expect(lookup.find('Krash yechish')).toBeNull();
    expect(lookup.find('Injektor tozalash')).toBeNull(); // k/c farqi
    expect(lookup.find('')).toBeNull();
  });

  it('yaroqsiz norma (0 yoki manfiy) e\'tiborga olinmaydi', () => {
    const bad = new NormLookup([{ nom_norm: 'test', brand: null, car_model: null, norma_daqiqa: 0 }]);
    expect(bad.find('test')).toBeNull();
    expect(bad.size).toBe(0);
  });
});

describe('splitMashina', () => {
  it('marka va modelga ajratadi', () => {
    expect(splitMashina('Chevrolet Gentra')).toEqual({ brand: 'Chevrolet', model: 'Gentra' });
    expect(splitMashina('Chevrolet Gentra 1.5')).toEqual({ brand: 'Chevrolet', model: 'Gentra 1.5' });
  });

  it('faqat marka yoki bo\'sh', () => {
    expect(splitMashina('Chevrolet')).toEqual({ brand: 'Chevrolet', model: null });
    expect(splitMashina('')).toEqual({ brand: null, model: null });
    expect(splitMashina(null)).toEqual({ brand: null, model: null });
  });
});
