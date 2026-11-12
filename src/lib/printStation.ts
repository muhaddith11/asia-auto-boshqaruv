// ─────────────────────────────────────────────────────────────────────────────
// Chek qaysi kompyuter printeridan chiqishi — har bir brauzer o'zi eslab qoladi.
//
// Chekni brauzer emas, print_agent.py chiqaradi. Asosiy agent (noutbuk, XP-80)
// print_status='pending' ni kutadi. Boshqa kompyuterdagi agent esa o'z nomi
// bilan belgilangan 'pending:<id>' ni kutadi (PRINT_AGENT_STATION=<id>).
// Shu sabab ikki agent bitta chekni ikki marta chiqarmaydi.
// ─────────────────────────────────────────────────────────────────────────────

export const PRINT_STATIONS = [
  { id: '', label: 'Asosiy printer (noutbuk)' },
  { id: 'kompyuter2', label: '2-kompyuter printeri' },
] as const;

const STORAGE_KEY = 'chek_printer_station';

export function getPrintStation(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || '';
    return PRINT_STATIONS.some((s) => s.id === saved) ? saved : '';
  } catch {
    return '';
  }
}

export function setPrintStation(id: string): void {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Saqlab bo'lmasa ham tanlov shu oynada ishlayveradi
  }
}

export function pendingStatusFor(station: string): 'pending' | `pending:${string}` {
  return station ? `pending:${station}` : 'pending';
}
