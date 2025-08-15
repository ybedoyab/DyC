import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Politician } from '../models/Politician';
import { createApiResponse } from '../utils/helpers';

/**
 * Middleware para verificar token JWT
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(
        createApiResponse(false, 'Token de acceso requerido', null, 'MISSING_TOKEN')
      );
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    console.log('Auth middleware - Token decodificado:', decoded);
    
    if (!decoded || decoded.type !== 'politician') {
      console.log('Auth middleware - Token inválido o tipo incorrecto:', decoded?.type);
      return res.status(401).json(
        createApiResponse(false, 'Token inválido o no autorizado', null, 'INVALID_TOKEN')
      );
    }

    // Verificar que el político existe y está activo
    const politician = await Politician.findOne({ 
      uuid: decoded.uuid, 
      isActive: true 
    });

    if (!politician) {
      return res.status(401).json(
        createApiResponse(false, 'Político no encontrado o inactivo', null, 'POLITICIAN_NOT_FOUND')
      );
    }

    // Agregar información del usuario a la request
    req.user = {
      uuid: politician.uuid,
      email: politician.email,
      isCandidato: politician.isCandidato,
      type: 'politician'
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json(
      createApiResponse(false, 'Token inválido o expirado', null, 'INVALID_TOKEN')
    );
  }
};

/**
 * Middleware para verificar si es candidato
 */
export const requireCandidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json(
      createApiResponse(false, 'Usuario no autenticado', null, 'NOT_AUTHENTICATED')
    );
  }

  if (!req.user.isCandidato) {
    return res.status(403).json(
      createApiResponse(false, 'Se requieren permisos de candidato', null, 'CANDIDATE_REQUIRED')
    );
  }

  next();
};

/**
 * Middleware para verificar si es representante
 */
export const requireRepresentative = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json(
      createApiResponse(false, 'Usuario no autenticado', null, 'NOT_AUTHENTICATED')
    );
  }

  if (req.user.isCandidato) {
    return res.status(403).json(
      createApiResponse(false, 'Se requieren permisos de representante', null, 'REPRESENTATIVE_REQUIRED')
    );
  }

  next();
};

/**
 * Middleware para verificar acceso a recursos propios
 */
export const canAccessResource = (resourceField: string = 'politicianId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'Usuario no autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    const resourceId = req.params[resourceField] || req.body[resourceField];
    
    if (!resourceId) {
      return res.status(400).json(
        createApiResponse(false, 'ID de recurso requerido', null, 'RESOURCE_ID_REQUIRED')
      );
    }

    // Los candidatos y representantes solo pueden acceder a sus propios recursos
    if (resourceId !== req.user.uuid) {
      return res.status(403).json(
        createApiResponse(false, 'Acceso denegado al recurso', null, 'ACCESS_DENIED')
      );
    }

    next();
  };
};
