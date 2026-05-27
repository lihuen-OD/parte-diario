import { createParte } from '../api/partes.api';
import { getPendingPartes, removePendingParte, updatePendingParteStatus, type PendingParte } from './db';

export async function syncPendingPartes() {
  const pending = await getPendingPartes();
  let synced = 0;

  for (const item of pending) {
    try {
      await createParte({ localId: item.localId, fecha: item.fecha, detalles: item.detalles });
      await removePendingParte(item.localId);
      synced += 1;
    } catch {
      await updatePendingParteStatus(item.localId, 'ERROR_SINCRONIZACION');
    }
  }

  return { synced, total: pending.length };
}

export async function persistParteOffline(part: Omit<PendingParte, 'status' | 'createdAt'>) {
  const record: PendingParte = {
    ...part,
    status: 'PENDIENTE_SINCRONIZACION',
    createdAt: new Date().toISOString(),
  };

  const { savePendingParte } = await import('./db');
  await savePendingParte(record);
}
