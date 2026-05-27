import { getCatalog, saveCatalog } from './db';
import { fetchActividades, fetchPredios, fetchTrabajadores } from '../api/catalogos.api';
import type { Actividad, Predio, Trabajador } from '../types';

export async function loadCatalogos(forceOnline = true) {
  if (navigator.onLine && forceOnline) {
    const [trabajadores, actividades, predios] = await Promise.all([
      fetchTrabajadores(),
      fetchActividades(),
      fetchPredios(),
    ]);

    await Promise.all([
      saveCatalog('trabajadores', trabajadores),
      saveCatalog('actividades', actividades),
      saveCatalog('predios', predios),
    ]);

    return { trabajadores, actividades, predios };
  }

  const trabajadores = (await getCatalog<Trabajador[]>('trabajadores')) ?? [];
  const actividades = (await getCatalog<Actividad[]>('actividades')) ?? [];
  const predios = (await getCatalog<Predio[]>('predios')) ?? [];

  return { trabajadores, actividades, predios };
}
