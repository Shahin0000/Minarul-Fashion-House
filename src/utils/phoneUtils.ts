/**
 * Phone number normalization and validation for Bangladeshi mobile numbers
 * Handles formats like:
 * 017XXXXXXXX, +88017XXXXXXXX, 88017XXXXXXXX, 018XXXXXXXX
 */

export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/[^0-9]/g, '');
  
  // Handles +8801XXXXXXXXX or 8801XXXXXXXXX (13 digits)
  if (digits.startsWith('8801') && digits.length === 13) {
    return digits.slice(2);
  }
  
  // Handles 01XXXXXXXXX (11 digits)
  if (digits.startsWith('01') && digits.length === 11) {
    return digits;
  }
  
  // Handles 1XXXXXXXXX (10 digits without leading 0)
  if (digits.startsWith('1') && digits.length === 10) {
    return '0' + digits;
  }
  
  return digits;
}

export function isValidBangladeshiPhone(rawPhone: string): boolean {
  const normalized = normalizePhoneNumber(rawPhone);
  // Valid Bangladeshi mobile operators start with 013, 014, 015, 016, 017, 018, 019
  return /^01[3-9]\d{8}$/.test(normalized);
}
