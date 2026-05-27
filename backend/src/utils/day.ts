export function getDayFromDate(fecha: string) {
  const [year, month, dayOfMonth] = fecha.slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, dayOfMonth);
  const day = new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date);

  return day.charAt(0).toUpperCase() + day.slice(1);
}
