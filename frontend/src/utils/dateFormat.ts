export function toDateOnlyString(dateValue: string) {
  return dateValue.slice(0, 10);
}

export function getTodayDateOnly() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toLocalDateOnly(dateValue: string) {
  const [year, month, day] = toDateOnlyString(dateValue).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateDisplay(dateValue: string) {
  if (!dateValue) return '';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(toLocalDateOnly(dateValue));
}

export function formatDateTimeDisplay(dateValue: string) {
  if (!dateValue) return '';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}
