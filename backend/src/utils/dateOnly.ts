export function toDateOnlyString(dateValue: Date | string) {
  if (typeof dateValue === 'string') {
    return dateValue.slice(0, 10);
  }

  return dateValue.toISOString().slice(0, 10);
}

export function dateOnlyToUtcDate(dateValue: string, endOfDay = false) {
  return new Date(`${dateValue.slice(0, 10)}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
}

