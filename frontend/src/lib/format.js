const fullDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'UTC' });
const shortDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });

function toDate(iso) {
  if (!iso) return null;
  const date = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(iso) {
  const date = toDate(iso);
  return date ? fullDate.format(date) : '';
}

export function formatShortDate(iso) {
  const date = toDate(iso);
  return date ? shortDate.format(date) : '';
}

export function formatPercent(ratio) {
  return ratio == null ? '—' : `${Math.round(ratio * 100)} %`;
}

export function plural(count, word) {
  return `${count} ${word}${count > 1 ? 's' : ''}`;
}

// Date locale du serveur (toISOString donnerait la date UTC).
export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function labelOf(list, value) {
  return list.find((item) => item.value === value)?.label ?? value;
}
