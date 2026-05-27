export type Rol = 'ADMIN' | 'WORKER';

export type EstadoSync = 'PENDIENTE' | 'SINCRONIZADO' | 'ERROR';

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Trabajador = { id: number; nombre: string; activo: boolean };
export type Actividad = { id: number; nombre: string; activo: boolean };
export type Predio = { id: number; nombre: string; activo: boolean };

export type ParteDetalle = {
  id?: number;
  parteDiarioId?: number;
  trabajadorId: number;
  actividadId: number;
  predioId: number;
  horas: number;
  total: number;
  observaciones?: string | null;
  trabajador?: Trabajador;
  actividad?: Actividad;
  predio?: Predio;
};

export type ParteDiario = {
  id: number;
  localId?: string | null;
  fecha: string;
  dia: string;
  creadoPorId: number;
  estadoSync: EstadoSync;
  syncedToGoogleSheet: boolean;
  googleSheetRowId?: string | null;
  createdAt: string;
  updatedAt: string;
  creadoPor?: Usuario;
  detalles: ParteDetalle[];
};

export type CatalogoKey = 'trabajadores' | 'actividades' | 'predios';
