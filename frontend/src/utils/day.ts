export function getDayFromDate(dateValue: string) {
  if (!dateValue) return '';
  const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date).replace(/^./, (char) => char.toUpperCase());
}
