import { v4 as uuidv4 } from 'uuid';
import { PaginationParams, PaginatedResponse } from '../types/common';

/**
 * Genera un UUID único
 */
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * Crea una respuesta paginada
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> => {
  const { page, limit } = params;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * Valida y normaliza parámetros de paginación
 */
export const validatePaginationParams = (params: any): PaginationParams => {
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10));
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';
  
  return { page, limit, sortBy, sortOrder };
};

/**
 * Crea un objeto de respuesta estándar de la API
 */
export const createApiResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string
) => {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
  };
};

/**
 * Sanitiza texto para evitar inyección de código
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '')
    .trim();
};

/**
 * Valida formato de documento de identidad (solo números)
 */
export const validateDocumentId = (documentId: string): boolean => {
  return /^\d+$/.test(documentId);
};

/**
 * Valida formato de número telefónico
 */
export const validatePhoneNumber = (phone: string): boolean => {
  return /^[\+]?[0-9\s\-\(\)]{7,15}$/.test(phone);
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formatea fecha para mostrar
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Obtiene la IP del cliente desde la request
 */
export const getClientIP = (req: any): string => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket?.remoteAddress || 
         'unknown';
};

/**
 * Obtiene el User-Agent del cliente
 */
export const getUserAgent = (req: any): string => {
  return req.get('User-Agent') || 'unknown';
};
