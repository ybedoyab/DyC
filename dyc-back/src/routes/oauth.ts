import { Router } from 'express';
import { 
  initiateGoogleOAuth, 
  googleOAuthCallback, 
  getOAuthStatus, 
  oauthLogout 
} from '../controllers/oauthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: Endpoints de autenticación OAuth con Google
 */

/**
 * @swagger
 * /api/auth/oauth/google:
 *   get:
 *     summary: Iniciar autenticación OAuth con Google
 *     tags: [OAuth]
 */
router.get('/google', initiateGoogleOAuth);

/**
 * @swagger
 * /api/auth/oauth/google/callback:
 *   get:
 *     summary: Callback de Google OAuth
 *     tags: [OAuth]
 */
router.get('/google/callback', googleOAuthCallback);

/**
 * @swagger
 * /api/auth/oauth/status:
 *   get:
 *     summary: Verificar estado de autenticación OAuth
 *     tags: [OAuth]
 */
router.get('/status', authenticateToken, getOAuthStatus);

/**
 * @swagger
 * /api/auth/oauth/logout:
 *   post:
 *     summary: Cerrar sesión OAuth
 *     tags: [OAuth]
 */
router.post('/logout', authenticateToken, oauthLogout);

export default router;
