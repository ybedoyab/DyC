import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { createApiResponse } from '../utils/helpers';

// Extender la interfaz Request para incluir el admin autenticado
declare global {
  namespace Express {
    interface Request {
      admin?: {
        uuid: string;
        username: string;
        permissions: string[];
      };
    }
  }
}

/**
 * Middleware para verificar token JWT de administrador
 */
export const authenticateAdmin = async (
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
    
    if (!decoded || decoded.type !== 'admin') {
      return res.status(401).json(
        createApiResponse(false, 'Token inválido o no autorizado', null, 'INVALID_TOKEN')
      );
    }

    // Verificar que el admin existe y está activo
    const admin = await Admin.findOne({ 
      uuid: decoded.uuid, 
      isActive: true 
    });

    if (!admin) {
      return res.status(401).json(
        createApiResponse(false, 'Administrador no encontrado o inactivo', null, 'ADMIN_NOT_FOUND')
      );
    }

    // Agregar información del admin a la request
    req.admin = {
      uuid: admin.uuid,
      username: admin.username,
      permissions: admin.permissions
    };

    next();
  } catch (error) {
    console.error('Error en autenticación de admin:', error);
    return res.status(401).json(
      createApiResponse(false, 'Token inválido o expirado', null, 'INVALID_TOKEN')
    );
  }
};

/**
 * Middleware para verificar permisos específicos
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json(
        createApiResponse(false, 'Administrador no autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    if (!req.admin.permissions.includes(permission) && !req.admin.permissions.includes('system_admin')) {
      return res.status(403).json(
        createApiResponse(false, 'Permisos insuficientes', null, 'INSUFFICIENT_PERMISSIONS')
      );
    }

    next();
  };
};

/**
 * Middleware para verificar si es admin del sistema
 */
export const requireSystemAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.admin) {
    return res.status(401).json(
      createApiResponse(false, 'Administrador no autenticado', null, 'NOT_AUTHENTICATED')
    );
  }

  if (!req.admin.permissions.includes('system_admin')) {
    return res.status(403).json(
      createApiResponse(false, 'Se requieren permisos de administrador del sistema', null, 'SYSTEM_ADMIN_REQUIRED')
    );
  }

  next();
};
