export interface Mijoz {
  id: number;
  ism: string;
  tel?: string;
  tel2?: string;
  mashina?: string;
  raqam?: string;
  yil?: string;
  vin?: string;
  skidka?: number;
  status: 'aktiv' | 'noaktiv';
  manzil?: string;
  tashriflar: number;
  jami: number;
  qarzdorlik: number;
}

export interface Xodim {
  id: number;
  ism: string;
  familiya?: string;
  tel?: string;
  mutax?: string;
  foiz: number; // Commission percentage or share percentage
  role?: 'xodim' | 'sherik';
  shareType?: 'total' | 'sub'; // total profit vs sub-share
  parentId?: number; // for sub-share partners
  login?: string;
  parol?: string;
  telegram?: string;
  status: 'aktiv' | 'noaktiv';
  createdAt?: string;
}

export interface Xizmat {
  id: number;
  nom: string;
  narx: number;
  mashina: string; // 'Umumiy' or specific model
  stavka?: number;
  // Legacy/Bot support
  name?: string;
  price?: number;
}

export interface Zapchast {
  id: number;
  nom: string;
  mashina?: string;
  sebestoimost: number; // Kelish narxi
  narx: number; // Sotish narxi
  bir: string; // 'dona', 'litr', etc.
  kat: string;
  supplier?: string;
  balance: number;
  // Legacy/Bot support
  name?: string;
  price?: number;
}

export interface OrderAssignment {
  workerId: number;
  services: number[]; // service IDs
}

export interface OrderService extends Xizmat {
  workerId: number;
  zarplata?: number; // Calculated salary for this service
}

export interface OrderZap extends Zapchast {
  qty: number;
  quantity?: number; // Legacy/Bot support
}

export interface Buyurtma {
  id: number;
  ism: string;
  tel?: string;
  mashina: string;
  raqam: string;
  yil?: string;
  vin?: string;
  km?: string;
  muammo?: string;
  sana: string; // YYYY-MM-DD
  holat: 'yaratildi' | 'tamirlanmoqda' | 'ehtiyot qism kutilyapti' | 'tulanmagan' | 'tulangan' | 'bekor qilingan';
  assignments: OrderAssignment[];
  services: OrderService[];
  zaps: OrderZap[];
  srv: number; // Total services price
  zap: number; // Total parts price
  total: number; // Before discount
  chegirma: number;
  final: number; // After discount (To'lov)
  zarplata: number; // Total workers' commission
  pribil: number; // Net profit (Final - Zarplata - Part Costs)
  print_status?: 'pending' | 'printed';
  createdAt: string;
  paid?: number;
}

export interface MaoshTarixi {
  id: number;
  xodimId: number;
  summa: number;
  davr: string; // YYYY-MM
  sana: string;
  method: 'naqd' | 'karta';
  izoh?: string;
  createdAt: string;
}

export interface ZapPurchase {
  id: number;
  date: string;
  supplier: string;
  totalCost: number;
  potentialProfit: number;
  partCount: number;
  status: 'qabul qilindi' | 'kutilmoqda';
}

export interface TashqariOperatsiya {
  id: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  method: 'naqd' | 'karta';
  amount: number;
  category: string;
  comment?: string;
  source: string;
  orderId?: string | number;
  profit?: number;
  toMethod?: 'naqd' | 'karta'; // For transfers
  createdAt: string;
}

export interface Kassa {
  naqd: number;
  karta: number;
}

export interface Counters {
  mijoz: number;
  xodim: number;
  xizmat: number;
  zap: number;
  buyurtma: number;
  cash: number;
  maosh: number;
  purchase: number;
}
