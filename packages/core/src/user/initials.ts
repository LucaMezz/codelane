export function getInitials(value: string | null | undefined, fallback = "U"): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return fallback;
  }

  const parts = normalizedValue.split(/\s+/).filter(Boolean);
  const initials =
    parts.length === 1 ? parts[0]?.slice(0, 2) : `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`;

  return initials?.toLocaleUpperCase() || fallback;
}
