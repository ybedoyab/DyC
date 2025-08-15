import { Request } from 'express';

// Extender la interfaz de Express Request
export interface ExtendedRequest extends Request {
  user?: {
    uuid: string;
    email: string;
    isCandidato: boolean;
    type: string;
  };
  admin?: {
    uuid: string;
    username: string;
    permissions: string[];
  };
}

// También extender globalmente para compatibilidad
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      uuid: string;
      email: string;
      isCandidato: boolean;
      type: string;
    };
    admin?: {
      uuid: string;
      username: string;
      permissions: string[];
    };
  }
}
