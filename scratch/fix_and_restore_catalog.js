
const fs = require('fs');

const chevrolet = {
  "matiz": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 120000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 40000 },
    { "name": "🌀 Drosil tozalash", "price": 50000 },
    { "name": "💉 Injector tozalash", "price": 70000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 200000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 50000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "tico": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 120000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 40000 },
    { "name": "🌀 Drosil tozalash", "price": 50000 },
    { "name": "💉 Injector tozalash", "price": 70000 }
  ],
  "damas": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 120000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 40000 },
    { "name": "🌀 Drosil tozalash", "price": 50000 },
    { "name": "💉 Injector tozalash", "price": 70000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 200000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 50000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "nexia 1, 2 (soh-doh)": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 120000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 40000 },
    { "name": "🌀 Drosil tozalash", "price": 50000 },
    { "name": "💉 Injector tozalash", "price": 70000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 200000 },
    { "name": "🚀 Stage urish", "price": 500000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 80000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "nexia 3": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 150000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 70000 },
    { "name": "💉 Injector tozalash", "price": 100000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 200000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 200000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "spark": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 150000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 70000 },
    { "name": "💉 Injector tozalash", "price": 100000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 200000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 200000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "cobalt": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 150000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 70000 },
    { "name": "💉 Injector tozalash", "price": 100000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 200000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 200000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "gentra": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 150000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 70000 },
    { "name": "💉 Injector tozalash", "price": 100000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 200000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 200000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "lacetti 1.8": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 150000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 70000 },
    { "name": "💉 Injector tozalash", "price": 100000 }
  ],
  "tracker 1": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 400000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 80000 },
    { "name": "💉 Injector tozalash", "price": 400000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 400000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 250000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "tracker 2": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 400000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 80000 },
    { "name": "💉 Injector tozalash", "price": 400000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 400000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 250000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "malibu 1": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 500000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 80000 },
    { "name": "💉 Injector tozalash", "price": 400000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 400000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 300000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "malibu 2 (2.4 atmosphera)": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 500000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 80000 },
    { "name": "💉 Injector tozalash", "price": 400000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 400000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 300000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "malibu 2 (1.5 turbo)": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 1000000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 100000 },
    { "name": "🌀 Drosil tozalash", "price": 100000 },
    { "name": "💉 Injector tozalash", "price": 600000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 400000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 400000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "malibu 2 (2.0 turbo)": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 1000000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 100000 },
    { "name": "🌀 Drosil tozalash", "price": 100000 },
    { "name": "💉 Injector tozalash", "price": 600000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 400000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 400000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "captiva 1, 2, 3": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 500000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 80000 },
    { "name": "💉 Injector tozalash", "price": 400000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 400000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 300000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "captiva 4": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 700000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 80000 },
    { "name": "💉 Injector tozalash", "price": 400000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 400000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 300000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 }
  ],
  "equinox": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 1000000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 100000 },
    { "name": "🌀 Drosil tozalash", "price": 100000 },
    { "name": "💉 Injector tozalash", "price": 600000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 600000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 400000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 },
    { "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)", "price": 150000 },
    { "name": "📱 Prilojeniye (Ilovalar) o'rnatish", "price": 600000 }
  ],
  "orlando 1, 2": [
    { "name": "🔍 Diagnostika", "price": 100000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 500000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 70000 },
    { "name": "💉 Injector tozalash", "price": 100000 },
    { "name": "🛣️ Probeg tekshirish", "price": 50000 },
    { "name": "💻 Programma yozish", "price": 400000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 300000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 },
    { "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)", "price": 150000 },
    { "name": "📱 Prilojeniye (Ilovalar) o'rnatish", "price": 100000 }
  ],
  "monza 1.3 , 1.5": [
    { "name": "🔍 Diagnostika", "price": 50000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 400000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 50000 },
    { "name": "🌀 Drosil tozalash", "price": 80000 },
    { "name": "💉 Injector tozalash", "price": 800000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 500000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 250000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 },
    { "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)", "price": 150000 },
    { "name": "📱 Prilojeniye (Ilovalar) o'rnatish", "price": 400000 }
  ],
  "traverse 1": [
    { "name": "🔍 Diagnostika", "price": 100000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 1000000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 100000 },
    { "name": "🌀 Drosil tozalash", "price": 100000 },
    { "name": "💉 Injector tozalash", "price": 600000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 800000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 100000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 500000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 200000 },
    { "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)", "price": 150000 },
    { "name": "📱 Prilojeniye (Ilovalar) o'rnatish", "price": 600000 }
  ],
  "traverse 2": [
    { "name": "🔍 Diagnostika", "price": 100000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 1000000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 100000 },
    { "name": "🌀 Drosil tozalash", "price": 100000 },
    { "name": "💉 Injector tozalash", "price": 600000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 800000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 100000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 500000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 200000 },
    { "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)", "price": 150000 },
    { "name": "📱 Prilojeniye (Ilovalar) o'rnatish", "price": 600000 }
  ],
  "tahoe 1": [
    { "name": "🔍 Diagnostika", "price": 100000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 1000000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 100000 },
    { "name": "🌀 Drosil tozalash", "price": 100000 },
    { "name": "💉 Injector tozalash", "price": 600000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 800000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 100000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 500000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 200000 },
    { "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)", "price": 150000 },
    { "name": "📱 Prilojeniye (Ilovalar) o'rnatish", "price": 600000 }
  ],
  "tahoe 2": [
    { "name": "🔍 Diagnostika", "price": 100000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 1000000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 100000 },
    { "name": "🌀 Drosil tozalash", "price": 100000 },
    { "name": "💉 Injector tozalash", "price": 600000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 800000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 100000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 500000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 200000 },
    { "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)", "price": 150000 },
    { "name": "📱 Prilojeniye (Ilovalar) o'rnatish", "price": 600000 }
  ],
  "trailblazer": [
    { "name": "🔍 Diagnostika", "price": 100000 },
    { "name": "⛽ Benzin sistemasini ko'rish", "price": 1000000 },
    { "name": "🚫 Tabloda datchik o'chirish", "price": 50000 },
    { "name": "🕯️ Svechalarni almashtirish", "price": 100000 },
    { "name": "🌀 Drosil tozalash", "price": 100000 },
    { "name": "💉 Injector tozalash", "price": 600000 },
    { "name": "🛣️ Probeg tekshirish", "price": 100000 },
    { "name": "💻 Programma yozish", "price": 600000 },
    { "name": "🚀 Stage urish", "price": 600000 },
    { "name": "⛽ Gaz regulirovka", "price": 50000 },
    { "name": "⛽ Benzin nasos ko'rish", "price": 400000 },
    { "name": "🧵 Simlarni to'g'irlash", "price": 100000 },
    { "name": "🇷🇺 Russifikatsiya (Rus tilida qilish)", "price": 150000 },
    { "name": "📱 Prilojeniye (Ilovalar) o'rnatish", "price": 600000 }
  ]
};

// --- DATA PROCESSING ---
// Extract existing data (already in route.ts, which includes the rest of the 11 brands)
const currentPath = 'c:/Users/nout.plus/OneDrive/Desktop/Projects made by AI/boshqaruv/src/app/api/bot-ui/catalog/route.ts';
const currentRaw = fs.readFileSync(currentPath, 'utf8');
const dataMatch = currentRaw.match(/const data = (\{[\s\S]+\});/);
let currentData = JSON.parse(dataMatch[1]);

// Fix duplicates in all brands
for (const brand in currentData.catalog) {
  for (const model in currentData.catalog[brand]) {
    const uniqueServices = [];
    const seen = new Set();
    currentData.catalog[brand][model].forEach(s => {
      const key = s.name + s.price;
      if (!seen.has(key)) {
        uniqueServices.push(s);
        seen.add(key);
      }
    });
    currentData.catalog[brand][model] = uniqueServices;
  }
}

// Merge back Chevrolet
currentData.catalog['Chevrolet'] = chevrolet;

// Update brands array to ensure prompt order
currentData.brands = ['Chevrolet', 'BYD', 'Kia', 'Hyundai', 'Chery', 'HAVAL', 'Jetour', 'Bestune', 'Leapmotors', 'Lada', 'Volkswagen', 'Li auto', 'Daewoo', 'Toyota', 'Mersedes', 'BMW', 'Boshqa'];

// Write back
const output = `import { NextResponse } from 'next/server';

export async function GET() {
  const data = ${JSON.stringify(currentData, null, 2)};
  return NextResponse.json(data);
}
`;

fs.writeFileSync(currentPath, output, 'utf8');
console.log("Successfully fixed duplicates and restored Chevrolet catalog.");
