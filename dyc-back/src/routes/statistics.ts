import { Router } from 'express';
import { 
  getStatistics, 
  getPoliticiansStatistics, 
  getReferidosStatistics 
} from '../controllers/statisticsController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Estadísticas del sistema
 */

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Obtener estadísticas generales del sistema
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     resumen:
 *                       type: object
 *                       properties:
 *                         totalPoliticians:
 *                           type: number
 *                           description: Total de políticos activos
 *                         totalCandidates:
 *                           type: number
 *                           description: Total de candidatos
 *                         totalRepresentatives:
 *                           type: number
 *                           description: Total de representantes
 *                         totalReferidos:
 *                           type: number
 *                           description: Total de referidos
 *                         politicosSinEmail:
 *                           type: number
 *                           description: Políticos sin email configurado
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
 *                     referidosPorMes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mes:
 *                             type: string
 *                           cantidad:
 *                             type: number
 *                     actividad:
 *                       type: object
 *                       properties:
 *                         porTipo:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               count:
 *                                 type: number
 *                         porAccion:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               count:
 *                                 type: number
 *                         reciente24h:
 *                           type: number
 */
router.get('/', getStatistics);

/**
 * @swagger
 * /api/statistics/politicians:
 *   get:
 *     summary: Obtener estadísticas detalladas de políticos
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Estadísticas de políticos obtenidas exitosamente
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
 *                     distribucionPorSexo:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: number
 *                     distribucionPorEdad:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: number
 *                     politicosConOAuth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: number
 *                     politicosMasActivos:
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
 */
router.get('/politicians', getPoliticiansStatistics);

/**
 * @swagger
 * /api/statistics/referidos:
 *   get:
 *     summary: Obtener estadísticas detalladas de referidos
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Estadísticas de referidos obtenidas exitosamente
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
 *                     referidosPorMes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mes:
 *                             type: string
 *                           cantidad:
 *                             type: number
 *                     referidosPorDiaSemana:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: number
 *                           count:
 *                             type: number
 *                     referidosPorHora:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: number
 *                           count:
 *                             type: number
 *                     topPoliticosPorReferidos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           politicianId:
 *                             type: string
 *                           politicianName:
 *                             type: string
 *                           isCandidato:
 *                             type: boolean
 *                           count:
 *                             type: number
 */
router.get('/referidos', getReferidosStatistics);

export default router;
