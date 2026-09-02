export interface ParsedEmailFrom {
  email: string;
  name?: string;
}

export function parseEmailFrom(raw: string): ParsedEmailFrom {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("EMAIL_FROM must be a non-empty sender address.");
  }

  const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { email: match[2].trim(), name: match[1].trim() };
  }

  return { email: trimmed };
}
