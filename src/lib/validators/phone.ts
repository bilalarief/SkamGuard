const MY_PHONE_REGEX = /^(\+?60|0)(1[0-9])-?\d{7,8}$/;

export function isValidMalaysianPhone(input: string): boolean {
  const cleaned = input.replace(/[\s\-().]/g, "");
  return MY_PHONE_REGEX.test(cleaned);
}

export function formatPhoneNumber(input: string): string {
  const cleaned = input.replace(/[\s\-().]/g, "");

  if (cleaned.startsWith("+60")) {
    const local = cleaned.slice(3);
    return `+60${local.slice(0, 2)}-${local.slice(2)}`;
  }
  if (cleaned.startsWith("60")) {
    const local = cleaned.slice(2);
    return `+60${local.slice(0, 2)}-${local.slice(2)}`;
  }
  if (cleaned.startsWith("0")) {
    const local = cleaned.slice(1);
    return `+60${local.slice(0, 2)}-${local.slice(2)}`;
  }

  return input;
}

export function normalizeToE164(input: string): string {
  const cleaned = input.replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+60")) return cleaned;
  if (cleaned.startsWith("60")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+60${cleaned.slice(1)}`;
  return cleaned;
}
