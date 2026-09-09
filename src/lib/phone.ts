// Bulgarian phone helpers
// Stored canonical: +359XXXXXXXXX (E.164). Display: +359 (8XX) XXX XXX

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^359/, "").replace(/^0/, "").slice(0, 9);
  const d = digits;
  let out = "+359";
  if (d.length > 0) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += ` ${d.slice(6, 9)}`;
  return out;
}

export function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "").replace(/^359/, "").replace(/^0/, "");
  if (digits.length !== 9) return null;
  if (!/^[89]/.test(digits)) return null;
  return `+359${digits}`;
}

export function isValidPhone(stored: string | null | undefined): boolean {
  if (!stored) return false;
  const digits = stored.replace(/\D/g, "");
  if (digits.startsWith("359") && digits.length === 12) return /^359[89]/.test(digits);
  if (digits.startsWith("0") && digits.length === 10) return /^0[89]/.test(digits);
  if (digits.length === 9) return /^[89]/.test(digits);
  return false;
}

export function fromE164(stored: string | null | undefined): string {
  if (!stored) return "";
  return formatPhone(stored);
}

/** @deprecated Use formatPhone */
export const formatTrPhone = formatPhone;
/** @deprecated Use toE164 */
export const toE164Tr = toE164;
