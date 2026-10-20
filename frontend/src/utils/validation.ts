/** Validation utilities for Signal Console. */

export const BANK_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const BANK_NAME_MAX_LENGTH = 100;
export const BANK_DESCRIPTION_MAX_LENGTH = 500;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBankName(name: string): ValidationResult {
  if (!name) {
    return { valid: false, error: 'Bank name is required' };
  }
  if (name.length > BANK_NAME_MAX_LENGTH) {
    return { valid: false, error: `Bank name must be at most ${BANK_NAME_MAX_LENGTH} characters` };
  }
  if (!BANK_NAME_PATTERN.test(name)) {
    return { valid: false, error: 'Bank name can only contain alphanumeric characters, underscores, and hyphens' };
  }
  return { valid: true };
}

export function validateBankDescription(description: string | undefined): ValidationResult {
  if (description !== undefined && description.length > BANK_DESCRIPTION_MAX_LENGTH) {
    return { valid: false, error: `Description must be at most ${BANK_DESCRIPTION_MAX_LENGTH} characters` };
  }
  return { valid: true };
}

export function sanitizeBankName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function truncateString(s: string, maxLength: number, suffix = '...'): string {
  if (s.length <= maxLength) return s;
  return s.slice(0, maxLength - suffix.length) + suffix;
}