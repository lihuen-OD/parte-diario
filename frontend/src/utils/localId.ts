export function createLocalId() {
  return `local_${new Date().toISOString().replace(/[-:.TZ]/g, '')}_${Math.random().toString(36).slice(2, 8)}`;
}
