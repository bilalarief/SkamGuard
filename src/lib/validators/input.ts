const MAX_TEXT_LENGTH = 5000;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function sanitizeText(input: string): string {
  return input
    .trim()
    .slice(0, MAX_TEXT_LENGTH)
    .replace(/<[^>]*>/g, "");
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "errors.invalidFormat" };
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: "errors.fileTooBig" };
  }

  return { valid: true };
}

export function isNotEmpty(input: string): boolean {
  return input.trim().length > 0;
}

export { MAX_TEXT_LENGTH, MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES };
