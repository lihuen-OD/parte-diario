import type { Rol } from './roles';

declare global {
  namespace Express {
    interface UserPayload {
      userId: number;
      rol: Rol;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
