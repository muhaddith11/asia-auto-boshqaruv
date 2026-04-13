
const fs = require('fs');

const chevroletDataRaw = `
matiz
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 120,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 40,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 50,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

tico
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 120,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 40,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 50,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

damas
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 100,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 40,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 70,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

nexia 1
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 120,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 40,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 50,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

nexia 2
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 120,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 40,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 50,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

nexia 3
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 150,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 50,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

lasseti
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 120,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 40,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 50,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

spark
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 150,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 100,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 50,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

captiva 1, 2, 3,
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 500,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 400,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 200,000 UZS |
| **8** | 💻 Programma yozish | 300,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 100,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

captiva 4
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 300,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 400,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 400,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 100,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

captiva 5
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 400,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 100,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 200,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 800,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 80,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 100,000 UZS |

gentra
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 120,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 40,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 50,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

cruze
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 120,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 70,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 100,000 UZS |

cobalt
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 400,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 50,000 UZS |
| **6** | 💉 Injector tozalash | 80,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 200,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

epica
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 500,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 200,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 250,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 50,000 UZS |
| **8** | 💻 Programma yozish | 300,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 80,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

onix
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 400,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 80,000 UZS |
| **6** | 💉 Injector tozalash | 70,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 250,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |

malibu 1
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 250,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 80,000 UZS |
| **6** | 💉 Injector tozalash | 150,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 200,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 80,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 100,000 UZS |

malibu 2
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 900,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 80,000 UZS |
| **6** | 💉 Injector tozalash | 600,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 600,000 UZS |
| **9** | 🚀 Stage urish | 800,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 250,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 100,000 UZS |

malibu 2.4
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 500,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 80,000 UZS |
| **6** | 💉 Injector tozalash | 300,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 400,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 250,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 200,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 100,000 UZS |

tracker 1
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 500,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 70,000 UZS |
| **6** | 💉 Injector tozalash | 100,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 400,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 300,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 100,000 UZS |

tracker 2
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 500,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 70,000 UZS |
| **6** | 💉 Injector tozalash | 100,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 400,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 300,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 100,000 UZS |

equinox 1
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 1,000,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 600,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 600,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 400,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 600,000 UZS |

equinox 2
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 1,000,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 600,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 600,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 400,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 600,000 UZS |

orlando 1, 2
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 500,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 70,000 UZS |
| **6** | 💉 Injector tozalash | 100,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 50,000 UZS |
| **8** | 💻 Programma yozish | 400,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 300,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 100,000 UZS |

monza 1.3 , 1.5
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 400,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 50,000 UZS |
| **5** | 🌀 Drosil tozalash | 80,000 UZS |
| **6** | 💉 Injector tozalash | 800,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 500,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 250,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 400,000 UZS |

traverse 1
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 1,000,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 600,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 800,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 100,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 500,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 200,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 600,000 UZS |

traverse 2
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 1,000,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 600,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 800,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 100,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 500,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 200,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 600,000 UZS |

tahoe 1 
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 1,000,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 600,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 800,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 100,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 500,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 200,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 600,000 UZS |

tahoe 2
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 1,000,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 600,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 800,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 100,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 50,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 200,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 600,000 UZS |

Trailblazer
| **1** | 🔍 Diagnostika | 50,000 UZS |
| **2** | ⛽ Benzin sistemasini ko'rish | 1,000,000 UZS |
| **3** | 🚫 Tabloda datchik o'chirish | 50,000 UZS |
| **4** | 🕯️ Svechalarni almashtirish | 100,000 UZS |
| **5** | 🌀 Drosil tozalash | 100,000 UZS |
| **6** | 💉 Injector tozalash | 600,000 UZS |
| **7** | 🛣️ Probeg tekshirish | 100,000 UZS |
| **8** | 💻 Programma yozish | 600,000 UZS |
| **9** | 🚀 Stage urish | 600,000 UZS |
| **10** | ⛽ Gaz regulirovka | 50,000 UZS |
| **11** | ⛽ Benzin nasos ko'rish | 400,000 UZS |
| **12** | 🧵 Simlarni to'g'irlash | 100,000 UZS |
| **13** | 🇷🇺 Russifikatsiya (Rus tilida qilish) | 150,000 UZS |
| **14** | 📱 Prilojeniye (Ilovalar) o'rnatish | 600,000 UZS |
`;

function parseMarkdownToObj(md) {
  const lines = md.split('\n');
  const catalog = {};
  let currentModel = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('|')) {
      if (trimmed.includes('---')) return;
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        const name = parts[2].replace(/\*\*/g, '').trim();
        const priceStr = parts[3].replace(/\*\*/g, '').replace(/,/g, '').replace(/\./g, '').replace(' UZS', '').trim();
        const price = parseInt(priceStr);
        if (!isNaN(price) && name) {
          if (!catalog[currentModel]) catalog[currentModel] = [];
          catalog[currentModel].push({ name, price });
        }
      }
    } else {
      currentModel = trimmed.toLowerCase();
    }
  });
  return catalog;
}

const cleanedChevrolet = parseMarkdownToObj(chevroletDataRaw);

// --- MERGE ---
const currentPath = 'c:/Users/nout.plus/OneDrive/Desktop/Projects made by AI/boshqaruv/src/app/api/bot-ui/catalog/route.ts';
const currentRaw = fs.readFileSync(currentPath, 'utf8');
const dataMatch = currentRaw.match(/const data = (\{[\s\S]+\});/);
let dataObj = JSON.parse(dataMatch[1]);

// Replace Chevrolet with cleaned version
dataObj.catalog['Chevrolet'] = cleanedChevrolet;

// Write back
const output = `import { NextResponse } from 'next/server';

export async function GET() {
  const data = ${JSON.stringify(dataObj, null, 2)};
  return NextResponse.json(data);
}
`;

fs.writeFileSync(currentPath, output, 'utf8');
console.log("Successfully cleaned car names and updated Chevrolet catalog.");
