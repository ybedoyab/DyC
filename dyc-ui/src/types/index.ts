// Tipos para el frontend DYC

export enum Sexo {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
  NO_BINARIO = 'no binario',
  OTRO = 'otro'
}

export interface Politician {
  uuid?: string;
  id?: string;
  nombres: string;
  apellidos: string;
  edad?: number;
  sexo?: Sexo;
  email: string;
  numeroTelefono?: string;
  documentoIdentidad: string;
  biografia?: string;
  fotoPerfil?: string;
  fotoCuerpoCompleto?: string;
  fotoPortada?: string;
  isCandidato: boolean;
  isActive: boolean;
  oauthProvider?: string;
  oauthId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  nombreCompleto?: string;
  rol?: string;
}

export interface Referido {
  uuid: string;
  nombres: string;
  apellidos: string;
  email: string;
  numeroTelefono?: string;
  documentoIdentidad: string;
  politicianId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  nombreCompleto?: string;
  politician?: Politician;
}

export interface UserSession {
  uuid: string;
  politicianId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export interface AuthUser {
  uuid?: string;
  id?: string;
  email: string;
  isCandidato: boolean;
  type: 'politician';
  nombres: string;
  apellidos: string;
  fotoPerfil?: string;
  nombreCompleto?: string;
  rol?: string;
}

export interface LoginFormData {
  nombres: string;
  apellidos: string;
  email: string;
  numeroTelefono?: string;
  documentoIdentidad: string;
  candidatoReferente: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationParams;
}

export interface Statistics {
  totalPoliticians: number;
  totalCandidates: number;
  totalRepresentatives: number;
  totalReferidos: number;
  referidosByPolitician: Array<{
    politicianId: string;
    politicianName: string;
    count: number;
  }>;
  referidosByMonth: Array<{
    month: string;
    count: number;
  }>;
}
