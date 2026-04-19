const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

export function isValidUrl(input: string): boolean {
  try {
    new URL(input.startsWith("http") ? input : `https://${input}`);
    return true;
  } catch {
    return false;
  }
}

export function extractUrls(text: string): string[] {
  return text.match(URL_REGEX) || [];
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function getDomain(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname;
  } catch {
    return url;
  }
}
