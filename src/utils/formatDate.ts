export function formatDate(date: string | Date, locale: string = 'he-IL'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date, locale: string = 'he-IL'): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return locale === 'he-IL' ? 'היום' : 'Today';
  if (diffDays === 1) return locale === 'he-IL' ? 'אתמול' : 'Yesterday';
  if (diffDays < 7) return locale === 'he-IL' ? `לפני ${diffDays} ימים` : `${diffDays} days ago`;
  return formatDate(date, locale);
}
