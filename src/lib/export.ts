// ─────────────────────────────────────────────────────────────────────────────
// Eksport yordamchilari — CSV (Excel ochadi) va JSON yuklab olish.
// Hech qanday tashqi kutubxonaga bog'liq emas.
// ─────────────────────────────────────────────────────────────────────────────

export type Column<T> = {
  key: keyof T | string;
  label: string;
  // ixtiyoriy formatlovchi
  format?: (row: T) => string | number;
};

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  // Excel formula-injection himoyasi
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  if (/[",\n;]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
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
 * Massivni CSV fayl sifatida yuklab oladi (UTF-8 BOM bilan — Excel kirill/lotinni
 * to'g'ri o'qishi uchun). Ajratuvchi `;` (O'zbekiston Excel'i uchun qulay).
 */
export function exportToCSV<T extends Record<string, any>>(
  filenameBase: string,
  rows: T[],
  columns: Column<T>[],
  separator: ';' | ',' = ';',
) {
  const header = columns.map(c => csvCell(c.label)).join(separator);
  const body = rows.map(row =>
    columns.map(c => {
      const raw = c.format ? c.format(row) : (row as any)[c.key];
      return csvCell(raw);
    }).join(separator)
  );
  const csv = '﻿' + [header, ...body].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filenameBase}_${stamp()}.csv`);
}

/** Ixtiyoriy obyektni JSON fayl sifatida yuklab oladi (zaxira nusxa). */
export function exportToJSON(filenameBase: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `${filenameBase}_${stamp()}.json`);
}
