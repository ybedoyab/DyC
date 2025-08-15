import { Router } from 'express';
import { 
  createReferido, 
  getMyReferidos, 
  getAllReferidos, 
  updateReferido, 
  deleteReferido 
} from '../controllers/referidoController';
import { authenticateToken, requireRepresentative } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Referidos
 *   description: Gestión de usuarios referidos por políticos
 */

/**
 * @swagger
 * /api/referidos:
 *   post:
 *     summary: Crear un nuevo referido
 *     tags: [Referidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombres
 *               - apellidos
 *               - email
 *               - documentoIdentidad
 *               - politicianId
 *             properties:
 *               nombres:
 *                 type: string
 *                 description: Nombres del referido
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del referido
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del referido
 *               numeroTelefono:
 *                 type: string
 *                 description: Número telefónico (opcional)
 *               documentoIdentidad:
 *                 type: string
 *                 description: Documento de identidad
 *               politicianId:
 *                 type: string
 *                 description: UUID del político que refiere
 *     responses:
 *       201:
 *         description: Referido creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Referido'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', createReferido);

/**
 * @swagger
 * /api/referidos/my-referidos:
 *   get:
 *     summary: Obtener referidos del político autenticado
 *     tags: [Referidos]
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
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Referidos obtenidos exitosamente
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
 *                     referidos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Referido'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autenticado
 */
router.get('/my-referidos', authenticateToken, getMyReferidos);

/**
 * @swagger
 * /api/referidos/{uuid}:
 *   put:
 *     summary: Actualizar referido (solo el político que lo creó)
 *     tags: [Referidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del referido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *                 description: Nombres del referido
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del referido
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del referido
 *               numeroTelefono:
 *                 type: string
 *                 description: Número telefónico
 *     responses:
 *       200:
 *         description: Referido actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Referido'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Referido no encontrado
 */
router.put('/:uuid', authenticateToken, updateReferido);

/**
 * @swagger
 * /api/referidos/{uuid}:
 *   delete:
 *     summary: Eliminar referido (solo el político que lo creó)
 *     tags: [Referidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del referido
 *     responses:
 *       200:
 *         description: Referido eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Referido no encontrado
 */
router.delete('/:uuid', authenticateToken, deleteReferido);

/**
 * @swagger
 * /api/referidos/all:
 *   get:
 *     summary: Obtener todos los referidos (solo para representantes)
 *     tags: [Referidos]
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
 *         description: Elementos por página
 *       - in: query
 *         name: politicianId
 *         schema:
 *           type: string
 *         description: Filtrar por político específico
 *     responses:
 *       200:
 *         description: Referidos obtenidos exitosamente
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
 *                     referidos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Referido'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo representantes)
 */
router.get('/all', authenticateToken, requireRepresentative, getAllReferidos);

export default router;
