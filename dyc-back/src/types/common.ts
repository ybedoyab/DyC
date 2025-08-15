// Tipos y interfaces comunes para el proyecto DYC

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Tipos para referidos populados
export interface PopulatedPolitician {
  _id: string;
  nombres: string;
  apellidos: string;
  isCandidato: boolean;
}

export interface PopulatedReferido {
  _id: string;
  uuid: string;
  nombres: string;
  apellidos: string;
  numeroTelefono?: string;
  documentoIdentidad: string;
  email: string;
  politicianId: PopulatedPolitician;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  documentoIdentidad: string;
  password: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface OAuthLoginRequest {
  provider: 'google' | 'microsoft' | 'facebook';
  code: string;
  redirectUri: string;
}

export interface LoginResponse {
  token: string;
  politician: {
    uuid: string;
    nombres: string;
    apellidos: string;
    isCandidato: boolean;
    fotoPerfil?: string;
  };
  expiresAt: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: {
    uuid: string;
    username: string;
    email: string;
    permissions: string[];
  };
  expiresAt: string;
}

export interface OAuthLoginResponse {
  token: string;
  politician: {
    uuid: string;
    nombres: string;
    apellidos: string;
    isCandidato: boolean;
    fotoPerfil?: string;
    email: string;
  };
  expiresAt: string;
}

export interface CreatePoliticianRequest {
  nombres: string;
  apellidos: string;
  edad?: number;
  sexo?: 'masculino' | 'femenino' | 'no binario' | 'otro';
  email: string;
  numeroTelefono?: string;
  documentoIdentidad: string;
  biografia?: string;
  fotoPerfil?: string;
  fotoCuerpoCompleto?: string;
  fotoPortada?: string;
  isCandidato: boolean;
  password: string;
}

export interface UpdatePoliticianRequest {
  nombres?: string;
  apellidos?: string;
  edad?: number;
  sexo?: 'masculino' | 'femenino' | 'no binario' | 'otro';
  email?: string;
  numeroTelefono?: string;
  biografia?: string;
  fotoPerfil?: string;
  fotoCuerpoCompleto?: string;
  fotoPortada?: string;
}

export interface CreateReferidoRequest {
  nombres: string;
  apellidos: string;
  email: string;
  numeroTelefono?: string;
  documentoIdentidad: string;
}

export interface UpdateReferidoRequest {
  nombres?: string;
  apellidos?: string;
  email?: string;
  numeroTelefono?: string;
}

export interface StatisticsResponse {
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

export interface DashboardResponse {
  politician: {
    uuid: string;
    nombres: string;
    apellidos: string;
    isCandidato: boolean;
    fotoPerfil?: string;
  };
  referidos: Array<{
    uuid: string;
    nombres: string;
    apellidos: string;
    numeroTelefono?: string;
    documentoIdentidad: string;
    createdAt: string;
  }>;
  totalReferidos: number;
}
