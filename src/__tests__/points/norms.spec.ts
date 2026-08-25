import { describe, it, expect } from 'vitest';
import {
  normalizeServiceName,
  normalizeCarKey,
  NormLookup,
  CarClassLookup,
  resolveNorm,
  splitMashina,
} from '@/lib/points/norms';

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

describe('normalizeCarKey', () => {
  it('bazadagi turli yozilishlarni bitta kalitga keltiradi', () => {
    // Jonli bazada shu uch xil yozilgan.
    expect(normalizeCarKey('Mercedes-Benz')).toBe('mercedesbenz');
    expect(normalizeCarKey('Mercedes-benz')).toBe('mercedesbenz');
    expect(normalizeCarKey('MERCEDESBENZ')).toBe('mercedesbenz');
    expect(normalizeCarKey('BYD')).toBe(normalizeCarKey('Byd'));
    // Model raqamlaridagi bo'shliq farqi
    expect(normalizeCarKey('EV 6')).toBe('ev6');
    expect(normalizeCarKey('EV6')).toBe('ev6');
  });

  it('bo\'sh/null — bo\'sh satr', () => {
    expect(normalizeCarKey(null)).toBe('');
    expect(normalizeCarKey('  ')).toBe('');
  });
});

describe('CarClassLookup', () => {
  const classes = new CarClassLookup([
    { brand_norm: 'chevrolet', car_model_norm: null, klass: 'oddiy', koeffitsient: 1.0 },
    { brand_norm: 'kia', car_model_norm: null, klass: 'orta', koeffitsient: 1.15 },
    { brand_norm: 'kia', car_model_norm: 'ev6', klass: 'elektro', koeffitsient: 1.3 },
    { brand_norm: 'byd', car_model_norm: null, klass: 'elektro', koeffitsient: 1.3 },
    { brand_norm: 'bmw', car_model_norm: null, klass: 'premium', koeffitsient: 1.5 },
  ]);

  it('marka darajasidagi koeffitsient', () => {
    expect(classes.find('Chevrolet', 'Gentra').koef).toBe(1.0);
    expect(classes.find('BYD', 'Han').koef).toBe(1.3);
    expect(classes.find('BMW', '320 I').koef).toBe(1.5);
  });

  it('model istisnosi markadan ustun — Kia benzin 1.15, Kia EV 6 esa 1.30', () => {
    expect(classes.find('Kia', 'Sportage').koef).toBe(1.15);
    expect(classes.find('Kia', 'EV 6').koef).toBe(1.3);
    expect(classes.find('Kia', 'EV6').koef).toBe(1.3); // bo'shliqsiz yozilishi
  });

  it('turli registrda yozilgan marka ham topiladi', () => {
    expect(classes.find('byd').koef).toBe(1.3);
    expect(classes.find('bMw').koef).toBe(1.5);
  });

  it('noma\'lum marka — 1.0 (bazaviy normada baholanadi)', () => {
    expect(classes.find('Joylong').koef).toBe(1);
    expect(classes.find(null).koef).toBe(1);
  });
});

describe('resolveNorm', () => {
  const norms = new NormLookup([
    { nom_norm: 'diagnostika', brand: null, car_model: null, norma_daqiqa: 30 },
    // Chevrolet uchun ATAYLAB qo'yilgan aniq norma
    { nom_norm: 'diagnostika', brand: 'Chevrolet', car_model: null, norma_daqiqa: 25 },
  ]);
  const classes = new CarClassLookup([
    { brand_norm: 'chevrolet', car_model_norm: null, klass: 'oddiy', koeffitsient: 1.0 },
    { brand_norm: 'byd', car_model_norm: null, klass: 'elektro', koeffitsient: 1.3 },
    { brand_norm: 'bmw', car_model_norm: null, klass: 'premium', koeffitsient: 1.5 },
  ]);

  it('bazaviy norma klass koeffitsientiga ko\'paytiriladi', () => {
    expect(resolveNorm(norms, classes, 'Diagnostika', 'BYD', 'Han')).toMatchObject({
      minutes: 39, koef: 1.3, klass: 'elektro', aniq: false,
    });
    expect(resolveNorm(norms, classes, 'Diagnostika', 'BMW', '320 I')).toMatchObject({
      minutes: 45, koef: 1.5, klass: 'premium',
    });
  });

  it('marka uchun ANIQ norma yozilgan bo\'lsa koeffitsient QO\'LLANMAYDI', () => {
    // Aks holda 25 x 1.0 emas, boshqa klassda ikki marta kengayib ketardi.
    const r = resolveNorm(norms, classes, 'Diagnostika', 'Chevrolet', 'Gentra');
    expect(r).toMatchObject({ minutes: 25, koef: 1, aniq: true });
  });

  it('noma\'lum marka — bazaviy norma o\'zgarishsiz', () => {
    expect(resolveNorm(norms, classes, 'Diagnostika', 'Joylong', 'Bus').minutes).toBe(30);
  });

  it('normasi yo\'q xizmat — koeffitsientdan qat\'i nazar null', () => {
    expect(resolveNorm(norms, classes, 'Vizf', 'BMW', '320 I').minutes).toBeNull();
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
