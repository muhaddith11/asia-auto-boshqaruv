export function normalizePhone(raw: string | undefined | null): string {
  if (!raw) return '';
  let d = String(raw).replace(/\D/g, '');
  if (!d) return '';
  
  // If user typed the prefix, isolate the part after it
  if (d.startsWith('998') && d.length > 3) {
    d = d.slice(3);
  } else if (d.startsWith('998') && d.length === 3) {
    // If it's just '998', we treat it as an empty local part
    return '+998';
  }
  
  const local = d.length <= 9 ? d : d.slice(-9);
  return `+998${local}`;
}

export function formatPhone(raw: string | undefined | null): string {
  const norm = normalizePhone(raw);
  if (!norm) return '+998 ';
  const digits = norm.replace(/^\+998/, '');
  const op = digits.slice(0, 2);
  const rest = digits.slice(2);

  let restFmt = '';
  if (!rest) restFmt = '';
  else if (rest.length <= 3) restFmt = rest;
  else if (rest.length <= 5) restFmt = `${rest.slice(0, 3)} ${rest.slice(3)}`;
  else restFmt = `${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)}`;

  return ['+998', op, restFmt].filter(Boolean).join(' ');
}

export function formatLocal(raw: string | undefined | null): string {
  const norm = normalizePhone(raw);
  if (!norm) return '';
  const digits = norm.replace(/^\+998/, '');
  const rest = digits.slice(2);
  if (!rest) return '';
  if (rest.length <= 3) return rest;
  if (rest.length <= 5) return `${rest.slice(0, 3)} ${rest.slice(3)}`;
  return `${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)}`;
}

export function isCompletePhone(raw: string | undefined | null): boolean {
  const norm = normalizePhone(raw);
  const d = norm.replace(/\D/g, '');
  return d.length >= 12 ? d.slice(-9).length === 9 : d.replace(/^998/, '').length === 9;
}
