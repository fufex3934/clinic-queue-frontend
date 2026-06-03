export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Normalize Ethiopian mobiles to +2519XXXXXXXX. */
export function normalizeEthiopianPhone(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  let digits = digitsOnly(trimmed);
  if (digits.startsWith("251")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length === 9 && /^9\d{8}$/.test(digits)) {
    return `+251${digits}`;
  }

  if (trimmed.startsWith("+")) {
    const intl = digitsOnly(trimmed);
    if (intl.length >= 7 && intl.length <= 15) {
      return `+${intl}`;
    }
  }

  return trimmed;
}

/** Display-friendly spacing for Ethiopian numbers. */
export function formatEthiopianPhone(phone: string): string {
  const n = normalizeEthiopianPhone(phone);
  const m = n.match(/^\+251(\d{2})(\d{3})(\d{4})$/);
  if (m) return `+251 ${m[1]} ${m[2]} ${m[3]}`;
  return phone;
}

export const ETHIOPIA_PHONE_PLACEHOLDER = "0912 345 678 or +251 912 345 678";
export const ETHIOPIA_PHONE_HINT =
  "Local 09… or international +251… — saved as +251 format";
