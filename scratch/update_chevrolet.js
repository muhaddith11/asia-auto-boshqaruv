const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const chevroletData = [
  { model: 'matiz', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 40000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'tico', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 40000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'damas', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 100000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 40000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 70000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'nexia 1', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 40000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'nexia 2', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 40000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'nexia 3', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 150000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'lasseti', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'spark', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 150000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 100000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'captiva 1, 2, 3,', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 500000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 400000},
    {n: '🛣️ Probeg tekshirish', p: 200000}, {n: '💻 Programma yozish', p: 300000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 100000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'captiva 4', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 300000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 400000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 400000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 100000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'captiva 5', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 400000}, {n: '🚫 Tabloda datchik o\'chirish', p: 100000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 200000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 800000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 80000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000}
  ]},
  { model: 'gentra', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 40000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'cruze', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 70000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000}
  ]},
  { model: 'cobalt', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 400000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 80000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 200000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'epica', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 500000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 200000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 250000},
    {n: '🛣️ Probeg tekshirish', p: 50000}, {n: '💻 Programma yozish', p: 300000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 80000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'onix', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 400000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 80000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 250000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ]},
  { model: 'malibu 1', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 250000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 80000}, {n: '💉 Injector tozalash', p: 150000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 80000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000}
  ]},
  { model: 'malibu 2 /primer', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 900000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 80000}, {n: '💉 Injector tozalash', p: 600000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 600000}, {n: '🚀 Stage urish', p: 800000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 250000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000}
  ]},
  { model: 'malibu 2.4', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 500000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 80000}, {n: '💉 Injector tozalash', p: 300000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 400000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 250000}, {n: '🧵 Simlarni to\'g\'irlash', p: 200000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000}
  ]},
  { model: 'tracker 1', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 500000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 70000}, {n: '💉 Injector tozalash', p: 100000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 400000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 300000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000}
  ]},
  { model: 'tracker 2', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 500000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 70000}, {n: '💉 Injector tozalash', p: 100000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 400000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 300000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000}
  ]},
  { model: 'equinox 1', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko' + "'" + 'rish', p: 1000000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 600000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 400000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000}
  ]},
  { model: 'equinox 2', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko' + "'" + 'rish', p: 1000000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 600000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 400000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000}
  ]},
  { model: 'orlando 1, 2', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 500000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 70000}, {n: '💉 Injector tozalash', p: 100000},
    {n: '🛣️ Probeg tekshirish', p: 50000}, {n: '💻 Programma yozish', p: 400000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 300000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000}
  ]},
  { model: 'monza 1.3 , 1.5', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 400000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 50000}, {n: '🌀 Drosil tozalash', p: 80000}, {n: '💉 Injector tozalash', p: 800000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 500000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 250000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 400000}
  ]},
  { model: 'traverse 1', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko' + "'" + 'rish', p: 1000000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 800000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 100000}, {n: '⛽ Benzin nasos ko\'rish', p: 500000}, {n: '🧵 Simlarni to\'g\'irlash', p: 200000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000}
  ]},
  { model: 'traverse 2', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko' + "'" + 'rish', p: 1000000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 800000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 100000}, {n: '⛽ Benzin nasos ko\'rish', p: 500000}, {n: '🧵 Simlarni to\'g\'irlash', p: 200000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000}
  ]},
  { model: 'tahoe 1', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko' + "'" + 'rish', p: 1000000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 800000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 100000}, {n: '⛽ Benzin nasos ko\'rish', p: 500000}, {n: '🧵 Simlarni to\'g\'irlash', p: 200000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000}
  ]},
  { model: 'tahoe 2', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko' + "'" + 'rish', p: 1000000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 800000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 100000}, {n: '⛽ Benzin nasos ko\'rish', p: 500000}, {n: '🧵 Simlarni to\'g\'irlash', p: 200000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000}
  ]},
  { model: 'Trailblazer', services: [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko' + "'" + 'rish', p: 1000000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 100000}, {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 600000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 400000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000}
  ]}
];

async function updateChevrolet() {
  console.log('🧹 Eski Chevrolet ma\'lumotlarini o\'chirish...');
  
  // First, find all Chevrolet car IDs to delete their services
  const { data: oldCars } = await supabase.from('cars_list').select('id, name').eq('brand', 'Chevrolet');
  
  if (oldCars && oldCars.length > 0) {
    const carModels = oldCars.map(c => c.name);
    // Delete services for these models
    await supabase.from('services_list').delete().eq('brand', 'Chevrolet');
    // Delete the cars themselves
    await supabase.from('cars_list').delete().eq('brand', 'Chevrolet');
  }

  console.log('📝 Yangi Chevrolet ma\'lumotlarini kiritish...');
  
  const carsToInsert = chevroletData.map(d => ({ brand: 'Chevrolet', name: d.model }));
  await supabase.from('cars_list').insert(carsToInsert);

  const servicesToInsert = [];
  chevroletData.forEach(d => {
    d.services.forEach(s => {
      servicesToInsert.push({
        brand: 'Chevrolet',
        car_model: d.model,
        name: s.n,
        price: s.p,
        stavka: 0
      });
    });
  });

  // Batch insert services
  const chunkSize = 100;
  for (let i = 0; i < servicesToInsert.length; i += chunkSize) {
    const chunk = servicesToInsert.slice(i, i + chunkSize);
    await supabase.from('services_list').insert(chunk);
  }

  console.log('✅ Chevrolet to\'liq yangilandi!');
}

updateChevrolet();
