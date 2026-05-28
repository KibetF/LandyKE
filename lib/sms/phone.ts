export function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("254")) return `+${d}`;
  if (d.startsWith("0")) return `+254${d.slice(1)}`;
  if (d.startsWith("7") || d.startsWith("1")) return `+254${d}`;
  return `+${d}`;
}

/** True if `e164` is a plausible E.164 number (+ followed by 9–15 digits). */
export function isValidPhone(e164: string): boolean {
  return /^\+\d{9,15}$/.test(e164);
}
