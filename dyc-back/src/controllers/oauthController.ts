import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Politician } from '../models/Politician';
import { UserSession } from '../models/UserSession';
import { AuditLog, AuditAction, EntityType } from '../models/AuditLog';
import { createApiResponse, generateUUID, getClientIP, getUserAgent } from '../utils/helpers';

/**
 * @swagger
 * /api/auth/oauth/google:
 *   get:
 *     summary: Iniciar autenticación OAuth con Google
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirección a Google OAuth
 */
export const initiateGoogleOAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

/**
 * @swagger
 * /api/auth/oauth/google/callback:
 *   get:
 *     summary: Callback de Google OAuth
 *     tags: [OAuth]
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *       401:
 *         description: Autenticación fallida
 */
export const googleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', async (err: any, politician: any, info: any) => {
    try {
      if (err) {
        console.error('Error en OAuth Google:', err);
        return res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=oauth_error`);
      }

      if (!politician) {
        return res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=no_politician`);
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          uuid: politician.uuid, 
          email: politician.email,
          isCandidato: politician.isCandidato,
          type: 'politician'
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      // Crear sesión de usuario
      const session = new UserSession({
        uuid: generateUUID(),
        politicianId: politician.uuid,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        isActive: true
      });

      await session.save();

      // Registrar auditoría
      const auditLog = new AuditLog({
        uuid: generateUUID(),
        action: AuditAction.LOGIN,
        entityType: EntityType.POLITICIAN,
        entityId: politician.uuid,
        userId: politician.uuid,
        timestamp: new Date(),
        details: {
          method: 'oauth',
          provider: 'google',
          ipAddress: getClientIP(req),
          userAgent: getUserAgent(req)
        },
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req)
      });

      await auditLog.save();

      // Redirigir al frontend con el token
      const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/oauth-success?token=${token}&politician=${encodeURIComponent(JSON.stringify({
        uuid: politician.uuid,
        nombres: politician.nombres,
        apellidos: politician.apellidos,
        isCandidato: politician.isCandidato,
        fotoPerfil: politician.fotoPerfil,
        email: politician.email
      }))}`;

      res.redirect(redirectUrl);

    } catch (error) {
      console.error('Error en callback OAuth:', error);
      res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=internal_error`);
    }
  })(req, res, next);
};

/**
 * @swagger
 * /api/auth/oauth/status:
 *   get:
 *     summary: Verificar estado de autenticación OAuth
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: No autenticado
 */
export const getOAuthStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    const userUuid = req.user.uuid;
    const politician = await Politician.findOne({ 
      uuid: userUuid, 
      isActive: true 
    });

    if (!politician) {
      return res.status(401).json(
        createApiResponse(false, 'Político no encontrado', null, 'POLITICIAN_NOT_FOUND')
      );
    }

    res.status(200).json(
      createApiResponse(true, 'Usuario autenticado', {
        uuid: politician.uuid,
        nombres: politician.nombres,
        apellidos: politician.apellidos,
        isCandidato: politician.isCandidato,
        fotoPerfil: politician.fotoPerfil,
        email: politician.email,
        oauthProvider: politician.oauthProvider
      })
    );

  } catch (error) {
    console.error('Error obteniendo estado OAuth:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

/**
 * @swagger
 * /api/auth/oauth/logout:
 *   post:
 *     summary: Cerrar sesión OAuth
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 */
export const oauthLogout = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    const userUuid = req.user.uuid;

    // Invalidar sesión
    await UserSession.updateMany(
      { politicianId: userUuid, isActive: true },
      { isActive: false }
    );

    // Registrar auditoría
    const auditLog = new AuditLog({
      uuid: generateUUID(),
      action: AuditAction.LOGOUT,
      entityType: EntityType.POLITICIAN,
      entityId: userUuid,
      userId: userUuid,
      timestamp: new Date(),
      details: {
        method: 'oauth_logout',
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req)
      },
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    });

    await auditLog.save();

    res.status(200).json(
      createApiResponse(true, 'Sesión cerrada exitosamente')
    );

  } catch (error) {
    console.error('Error en logout OAuth:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};
