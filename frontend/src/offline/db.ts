import type { CatalogoKey, ParteDetalle } from '../types';

export type PendingParte = {
  localId: string;
  fecha: string;
  detalles: ParteDetalle[];
  status: 'PENDIENTE_SINCRONIZACION' | 'ERROR_SINCRONIZACION' | 'SINCRONIZADO';
  createdAt: string;
};

type CatalogRecord = {
  key: CatalogoKey;
  data: unknown;
  updatedAt: string;
};

const DB_NAME = 'parte-diario-offline-db';
const DB_VERSION = 1;

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('pendingPartes')) {
        db.createObjectStore('pendingPartes', { keyPath: 'localId' });
      }

      if (!db.objectStoreNames.contains('catalogos')) {
        db.createObjectStore('catalogos', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function write<T>(storeName: string, value: T) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value as IDBValidKey);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function remove(storeName: string, key: IDBValidKey) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function readAll<T>(storeName: string) {
  const db = await openDB();
  return new Promise<T[]>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

async function readOne<T>(storeName: string, key: IDBValidKey) {
  const db = await openDB();
  return new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function savePendingParte(parte: PendingParte) {
  await write('pendingPartes', parte);
}

export async function getPendingPartes() {
  return readAll<PendingParte>('pendingPartes');
}

export async function removePendingParte(localId: string) {
  await remove('pendingPartes', localId);
}

export async function updatePendingParteStatus(localId: string, status: PendingParte['status']) {
  const pending = await readOne<PendingParte>('pendingPartes', localId);
  if (!pending) return;
  await write('pendingPartes', { ...pending, status });
}

export async function saveCatalog(key: CatalogoKey, data: unknown) {
  const record: CatalogRecord = { key, data, updatedAt: new Date().toISOString() };
  await write('catalogos', record);
}

export async function getCatalog<T>(key: CatalogoKey) {
  const record = await readOne<CatalogRecord>('catalogos', key);
  return record?.data as T | undefined;
}
