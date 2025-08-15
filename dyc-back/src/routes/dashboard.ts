import { Router } from 'express';
import { 
  getDashboard, 
  getRepresentativeDashboard,
  getReferidos
} from '../controllers/dashboardController';
import { authenticateToken, requireRepresentative } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard personal para políticos
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Dashboard personal del político autenticado
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     politician:
 *                       type: object
 *                       properties:
 *                         uuid:
 *                           type: string
 *                         nombres:
 *                           type: string
 *                         apellidos:
 *                           type: string
 *                         isCandidato:
 *                           type: boolean
 *                         fotoPerfil:
 *                           type: string
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         totalReferidos:
 *                           type: number
 *                         referidosRecientes:
 *                           type: number
 *                         referidosPorMes:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               mes:
 *                                 type: string
 *                               cantidad:
 *                                 type: number
 *                     referidosRecientes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Referido'
 *                     actividadReciente:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                           entityType:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                           format: date-time
 *       401:
 *         description: No autenticado
 */
router.get('/', authenticateToken, getDashboard);

/**
 * @swagger
 * /api/dashboard/referidos:
 *   get:
 *     summary: Obtener referidos del político autenticado con paginación
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Referidos obtenidos exitosamente
 *       401:
 *         description: No autenticado
 */
router.get('/referidos', authenticateToken, getReferidos);

/**
 * @swagger
 * /api/dashboard/representative:
 *   get:
 *     summary: Dashboard extendido para representantes
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard de representante obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     estadisticasGenerales:
 *                       type: object
 *                       properties:
 *                         totalPoliticians:
 *                           type: number
 *                         totalCandidates:
 *                           type: number
 *                         totalRepresentatives:
 *                           type: number
 *                         totalReferidos:
 *                           type: number
 *                     referidosPorPolitico:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           politicianId:
 *                             type: string
 *                           politicianName:
 *                             type: string
 *                           count:
 *                             type: number
 *                     actividadSistema:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                           entityType:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                           format: date-time
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo representantes)
 */
router.get('/representative', authenticateToken, requireRepresentative, getRepresentativeDashboard);

export default router;
