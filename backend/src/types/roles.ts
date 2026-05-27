export const ROLES = {
  ADMIN: 'ADMIN',
  WORKER: 'WORKER',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

export const ESTADO_SYNC = {
  PENDIENTE: 'PENDIENTE',
  SINCRONIZADO: 'SINCRONIZADO',
  ERROR: 'ERROR',
} as const;

export type EstadoSync = (typeof ESTADO_SYNC)[keyof typeof ESTADO_SYNC];
