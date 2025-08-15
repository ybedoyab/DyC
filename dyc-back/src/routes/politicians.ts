import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  getPublicProfile, 
  getPoliticians 
} from '../controllers/politicianController';
import { authenticateToken } from '../middleware/auth';
import { uploadProfilePhotos } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Politicians
 *   description: Gestión de candidatos y representantes
 */

/**
 * @swagger
 * /api/politicians:
 *   get:
 *     summary: Obtener lista de políticos activos
 *     tags: [Politicians]
 *     parameters:
 *       - in: query
 *         name: isCandidato
 *         schema:
 *           type: boolean
 *         description: Filtrar por tipo (candidato o representante)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de políticos obtenida exitosamente
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
 *                     politicians:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Politician'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/', getPoliticians);

/**
 * @swagger
 * /api/politicians/{uuid}:
 *   get:
 *     summary: Obtener perfil público de un político
 *     tags: [Politicians]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del político
 *     responses:
 *       200:
 *         description: Perfil público obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Politician'
 *       404:
 *         description: Político no encontrado
 */
router.get('/:uuid', getPublicProfile);

/**
 * @swagger
 * /api/politicians/profile:
 *   get:
 *     summary: Obtener perfil del político autenticado
 *     tags: [Politicians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Politician'
 *       401:
 *         description: No autenticado
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/politicians/profile:
 *   put:
 *     summary: Actualizar perfil del político autenticado
 *     tags: [Politicians]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *                 description: Nombres del político
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del político
 *               edad:
 *                 type: number
 *                 description: Edad del político
 *               sexo:
 *                 type: string
 *                 enum: [masculino, femenino, no binario, otro]
 *                 description: Sexo del político
 *               numeroTelefono:
 *                 type: string
 *                 description: Número telefónico
 *               biografia:
 *                 type: string
 *                 description: Biografía del político
 *               fotoPerfil:
 *                 type: string
 *                 description: URL de la foto de perfil
 *               fotoCuerpoCompleto:
 *                 type: string
 *                 description: URL de la foto de cuerpo completo
 *               fotoPortada:
 *                 type: string
 *                 description: URL de la foto de portada
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Politician'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.put('/profile', authenticateToken, uploadProfilePhotos, updateProfile);

export default router;
