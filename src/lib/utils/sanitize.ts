/**
 * Input sanitization utilities.
 *
 * Defence-in-depth layer that runs AFTER Zod validation.
 * Strips control chars, HTML injection, null bytes, and enforces size limits.
 *
 * @module lib/utils/sanitize
 */

// ─── Constants ───

const BASE64_PATTERN = /^[A-Za-z0-9+/=]+$/
/** 10 MB — maximum base64 payload after stripping data URI prefix */
const MAX_BASE64_LENGTH = 10 * 1024 * 1024
/** 5 000 chars — maximum text input (matches Zod schema) */
const MAX_TEXT_LENGTH = 5000
/** 20 chars — generous for Malaysian phone numbers */
const MAX_PHONE_LENGTH = 20
/** 2048 chars — standard browser URL bar limit */
const MAX_URL_LENGTH = 2048
/** 500 chars — description fields (reports, etc.) */
const MAX_DESCRIPTION_LENGTH = 500

// ─── Dangerous characters ───

/** ASCII control characters excluding safe whitespace (tab, LF, CR) */
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
/** HTML/XML tags — strip to prevent XSS in stored content */
const HTML_TAGS = /<[^>]*>/g
/** Null byte — used in path traversal / injection attacks */
const NULL_BYTE = /\0/g

// ─── Sanitizers ───

/**
 * Sanitize a base64-encoded image string.
 * Strips optional data URI prefix, validates character set, enforces size limit.
 *
 * @returns Clean base64 string or null if invalid
 */
export function sanitizeBase64(input: string): string | null {
  // Strip data URI prefix (e.g. "data:image/png;base64,...")
  const base64Data = input.includes(',')
    ? input.split(',')[1]
    : input

  if (!base64Data || base64Data.length === 0) {
    return null
  }

  if (base64Data.length > MAX_BASE64_LENGTH) {
    return null
  }

  if (!BASE64_PATTERN.test(base64Data)) {
    return null
  }

  return base64Data
}

/**
 * Sanitize free-form text input.
 * Strips HTML tags, control characters, null bytes, and enforces length.
 *
 * @returns Clean text string (may be empty)
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(NULL_BYTE, '')       // Null byte injection
    .replace(HTML_TAGS, '')       // XSS via stored HTML
    .replace(CONTROL_CHARS, '')   // Non-printable control chars
    .slice(0, MAX_TEXT_LENGTH)
}

/**
 * Sanitize phone number input.
 * Only allows digits and leading +, enforces max length.
 *
 * @returns Clean phone string (digits + optional leading +)
 */
export function sanitizePhone(input: string): string {
  return input
    .trim()
    .replace(NULL_BYTE, '')
    .replace(/[^0-9+]/g, '')
    .slice(0, MAX_PHONE_LENGTH)
}

/**
 * Sanitize URL input.
 * Strips whitespace, null bytes, control chars.
 * Does NOT validate URL format (that's Zod / isValidUrl's job).
 *
 * @returns Clean URL string
 */
export function sanitizeUrl(input: string): string {
  return input
    .trim()
    .replace(NULL_BYTE, '')
    .replace(CONTROL_CHARS, '')
    .slice(0, MAX_URL_LENGTH)
}

/**
 * Sanitize description / free-text fields used in reports.
 * Shorter limit than general text. Strips HTML + control chars.
 *
 * @returns Clean description string
 */
export function sanitizeDescription(input: string): string {
  return input
    .trim()
    .replace(NULL_BYTE, '')
    .replace(HTML_TAGS, '')
    .replace(CONTROL_CHARS, '')
    .slice(0, MAX_DESCRIPTION_LENGTH)
}
