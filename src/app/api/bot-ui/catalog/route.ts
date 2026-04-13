import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
  "brands": [
    "Chevrolet",
    "BYD",
    "Kia",
    "Hyundai",
    "Chery",
    "HAVAL",
    "Jetour",
    "Bestune",
    "Leapmotors",
    "Lada",
    "Volkswagen",
    "Li auto",
    "Daewoo",
    "Toyota",
    "Mersedes",
    "BMW",
    "Boshqa"
  ],
  "catalog": {
    "BYD": {
      "Song Plus": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "Song plus gibrid": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "chempion gibrid": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Chazor": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Seal": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Xan gibrid": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Song Pro": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Seagull": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "Tang": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Yuan": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "Yuan up": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "Yuan up gibrid": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 1000000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 1000000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 200000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 200000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 500000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 1200000
        }
      ]
    },
    "Kia": {
      "Carnival": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Bongo": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Bongo EV": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "EV 3": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "EV 5": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "EV 6": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "EV 9": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "K 3": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "K 5": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "K 8": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "K 8 restaylin": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "K 9": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Morning": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 400000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 400000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Seltos": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Sorento": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 600000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Sportage": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 600000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ]
    },
    "Hyundai": {
      "Elantra": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 600000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "creta": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Ioniq5": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "Ioniq6": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "Ioniq9": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "Palisade": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Porter": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Santa fe": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Sonata": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Sonata 2008": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 150000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 50000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 50000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 50000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 50000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 200000
        },
        {
          "name": "💻 Programma yozish",
          "price": 200000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 50000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 50000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Staria": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Starex": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "Tranjet": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 400000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 400000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ]
    },
    "Chery": {
      "arizo 6 pro": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "arizo 7 pro": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "tiggo 2": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "tiggo 6 pro": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "tiggo 7 pro": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "tiggo 8 pro": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ]
    },
    "HAVAL": {
      "M6": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "H6": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "JOLION": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "DARGO": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ]
    },
    "Jetour": {
      "X 70": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "X90": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "X95": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "DASHING": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ]
    },
    "Bestune": {
      "T 33": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "T 55": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 600000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "T 77": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 500000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "T 99": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "B 70": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 300000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ]
    },
    "Leapmotors": {
      "C 01": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 200000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "C 10": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 200000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "C 11": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 200000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "C 16": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 200000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ]
    },
    "Lada": {
      "vesta": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 500000
        },
        {
          "name": "💻 Programma yozish",
          "price": 500000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        }
      ],
      "X ray": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 500000
        },
        {
          "name": "💻 Programma yozish",
          "price": 500000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        }
      ],
      "gazel": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 500000
        },
        {
          "name": "💻 Programma yozish",
          "price": 500000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        }
      ],
      "granta": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 500000
        },
        {
          "name": "💻 Programma yozish",
          "price": 500000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        }
      ]
    },
    "Volkswagen": {
      "ID 3": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "ID 4": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "ID 6": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🔋 Batareya holatini tekshirish",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🧵 Simlarni to'g'irlash (Izolatsiya)",
          "price": 500000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "📱 Ilovalar (App) o'rnatish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🛞 Batareya yechish",
          "price": 12000000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🔌 Zaryadlash portini remonti",
          "price": 600000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "🌀 Konditsioner remont",
          "price": 600000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        },
        {
          "name": "⚡ Invertor holatini tekshirish",
          "price": 100000
        }
      ],
      "CADDY": [
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 50000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 300000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 50000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 400000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 400000
        },
        {
          "name": "💻 Programma yozish",
          "price": 400000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 50000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 100000
        }
      ]
    },
    "Li auto": {
      "LI 6": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "LI 7": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "LI 8": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "LI 9": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ],
      "LI 9 Restaling": [
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "🔍 Diagnostika",
          "price": 100000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "⛽ Benzin sistemasini ko'rish",
          "price": 700000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🚫 Tabloda datchik o'chirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🕯️ Svechalarni almashtirish",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "🌀 Drosil tozalash",
          "price": 100000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "💉 Injector tozalash",
          "price": 600000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "🛣️ Probeg tekshirish",
          "price": 100000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "💻 Programma yozish",
          "price": 800000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "🚀 Stage urish",
          "price": 600000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Gaz regulirovka",
          "price": 100000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "⛽ Benzin nasos ko'rish",
          "price": 150000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🧵 Simlarni to'g'irlash",
          "price": 200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)",
          "price": 1200000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        },
        {
          "name": "📱 Prilojeniye (Ilovalar) o'rnatish",
          "price": 300000
        }
      ]
    },
    "Chevrolet": {}
  }
};
  return NextResponse.json(data);
}
