// ─────────────────────────────────────────────────────────────────────────────
// Eksport yordamchilari — Excel (.xls) va JSON yuklab olish.
// Excel/WPS to'g'ridan-to'g'ri ustunlarga bo'lib ochishi uchun CSV emas,
// HTML-jadval (.xls) ishlatamiz — ajratuvchi muammosi umuman bo'lmaydi.
// Hech qanday tashqi kutubxonaga bog'liq emas.
// ─────────────────────────────────────────────────────────────────────────────

export type Column<T> = {
  key: keyof T | string;
  label: string;
  // ixtiyoriy formatlovchi
  format?: (row: T) => string | number;
};

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

/**
 * Massivni Excel (.xls) fayl sifatida yuklab oladi.
 * HTML-jadval ko'rinishida — Excel/WPS ustunlarga to'g'ri bo'ladi, kirill/lotin
 * UTF-8 da to'g'ri chiqadi, ajratuvchi (`;`/`,`) muammosi yo'q.
 */
export function exportToCSV<T extends Record<string, any>>(
  filenameBase: string,
  rows: T[],
  columns: Column<T>[],
) {
  const headRow = `<tr>${columns
    .map(c => `<th style="background:#dbe5f1;border:1px solid #999;font-weight:bold;padding:4px">${escapeHtml(c.label)}</th>`)
    .join('')}</tr>`;

  const bodyRows = rows
    .map(row => `<tr>${columns
      .map(c => {
        const raw = c.format ? c.format(row) : (row as any)[c.key];
        return `<td style="border:1px solid #ccc;padding:3px">${escapeHtml(raw)}</td>`;
      })
      .join('')}</tr>`)
    .join('');

  const html =
    `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head>` +
    `<body><table border="1" style="border-collapse:collapse">${headRow}${bodyRows}</table></body></html>`;

  // UTF-8 BOM — kirill/lotin to'g'ri o'qilishi uchun
  const blob = new Blob([String.fromCharCode(0xFEFF) + html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  triggerDownload(blob, `${filenameBase}_${stamp()}.xls`);
}

/** Ixtiyoriy obyektni JSON fayl sifatida yuklab oladi (zaxira nusxa). */
export function exportToJSON(filenameBase: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `${filenameBase}_${stamp()}.json`);
}
