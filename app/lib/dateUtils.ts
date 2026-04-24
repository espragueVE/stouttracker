const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateSafely(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const dateOnlyMatch = trimmed.match(DATE_ONLY_PATTERN);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day), 12);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  const parsedDate = new Date(trimmed);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatDate(
  value: string | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const parsedDate = parseDateSafely(value);

  if (!parsedDate) {
    return value || "N/A";
  }

  return parsedDate.toLocaleDateString(locale, options);
}

export function formatDateTime(
  value: string | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const parsedDate = parseDateSafely(value);

  if (!parsedDate) {
    return value || "N/A";
  }

  return parsedDate.toLocaleString(locale, options);
}

export function getTodayLocalDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toDateInputValue(value: string | null | undefined): string {
  const parsedDate = parseDateSafely(value);

  if (!parsedDate) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}