import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { Politician } from '../models/Politician';
import { Referido } from '../models/Referido';
import { AuditLog } from '../models/AuditLog';
import { createApiResponse, generateUUID, getClientIP, getUserAgent } from '../utils/helpers';

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Iniciar sesión para administradores
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(
        createApiResponse(false, 'Usuario y contraseña son requeridos', null, 'MISSING_FIELDS')
      );
    }

    // Verificar credenciales del .env
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin';

    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json(
        createApiResponse(false, 'Credenciales incorrectas', null, 'INVALID_CREDENTIALS')
      );
    }

    // Buscar o crear admin en la base de datos
    let admin = await Admin.findOne({ username, isActive: true });
    
    if (!admin) {
      // Crear admin si no existe
      admin = new Admin({
        uuid: generateUUID(),
        username,
        email: `${username}@dyc.com`,
        isActive: true,
        permissions: ['system_admin']
      });
      await admin.save();
    }

    // Actualizar último login
    admin.lastLogin = new Date();
    await admin.save();

    // Generar token JWT
    const token = jwt.sign(
      { 
        uuid: admin.uuid, 
        username: admin.username,
        type: 'admin',
        permissions: admin.permissions
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Registrar auditoría - TEMPORALMENTE DESHABILITADO POR ERROR DE VALIDACIÓN
    // const auditLog = new AuditLog({
    //   uuid: generateUUID(),
    //   action: 'LOGIN',
    //   entityType: 'admin',
    //   entityId: admin.uuid,
    //   userId: admin.uuid,
    //   timestamp: new Date(),
    //   details: {
    //     method: 'admin_login'
    //   },
    //   ipAddress: getClientIP(req),
    //   userAgent: getUserAgent(req)
    // });

    // await auditLog.save();

    // Respuesta exitosa
    const response = {
      token,
      admin: {
        uuid: admin.uuid,
        username: admin.username,
        email: admin.email,
        permissions: admin.permissions
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    res.status(200).json(
      createApiResponse(true, 'Login de administrador exitoso', response)
    );

  } catch (error) {
    console.error('Error en login de admin:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

/**
 * @swagger
 * /api/admin/politicians/{uuid}/email:
 *   patch:
 *     summary: Actualizar email de un político (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Político no encontrado
 */
export const updatePoliticianEmail = async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        createApiResponse(false, 'Email es requerido', null, 'MISSING_EMAIL')
      );
    }

    // Buscar político
    const politician = await Politician.findOne({ uuid, isActive: true });
    
    if (!politician) {
      return res.status(404).json(
        createApiResponse(false, 'Político no encontrado', null, 'POLITICIAN_NOT_FOUND')
      );
    }

    // Verificar que el email no esté en uso
    const existingPolitician = await Politician.findOne({ 
      email, 
      uuid: { $ne: uuid },
      isActive: true 
    });

    if (existingPolitician) {
      return res.status(400).json(
        createApiResponse(false, 'El email ya está en uso por otro político', null, 'EMAIL_ALREADY_EXISTS')
      );
    }

    // Actualizar email
    politician.email = email.toLowerCase();
    politician.updatedBy = req.user?.uuid || 'admin';
    await politician.save();

    // Registrar auditoría - TEMPORALMENTE DESHABILITADO POR ERROR DE VALIDACIÓN
    // const auditLog = new AuditLog({
    //   uuid: generateUUID(),
    //   action: 'UPDATE',
    //   entityType: 'politician',
    //   entityId: politician.uuid,
    //   userId: req.user?.uuid || 'admin',
    //   timestamp: new Date(),
    //   details: {
    //     field: 'email',
    //     oldValue: politician.email,
    //     newValue: email,
    //     ipAddress: getClientIP(req),
    //     userAgent: getUserAgent(req)
    //   },
    //   ipAddress: getClientIP(req),
    //   userAgent: getUserAgent(req)
    // });

    // await auditLog.save();

    res.status(200).json(
      createApiResponse(true, 'Email del político actualizado exitosamente', { email: politician.email })
    );

  } catch (error) {
    console.error('Error actualizando email del político:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Obtener logs de auditoría (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [politician, referido, admin]
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT]
 *     responses:
 *       200:
 *         description: Logs de auditoría obtenidos
 *       401:
 *         description: No autorizado
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, entityType, action } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    
    // Construir filtros
    const filters: any = {};
    if (entityType) filters.entityType = entityType;
    if (action) filters.action = action;

    // Contar total
    const total = await AuditLog.countDocuments(filters);
    
    // Obtener logs paginados
    const logs = await AuditLog.find(filters)
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-__v')
      .lean(); // Usar lean() para objetos planos de JavaScript

    // Transformar logs para incluir solo id
    const transformedLogs = logs.map(log => ({
      id: log._id,
      uuid: log.uuid,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      userId: log.userId,
      timestamp: log.timestamp,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent
    }));

    const totalPages = Math.ceil(total / limitNum);

    const response = {
      data: transformedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    };

    res.status(200).json(
      createApiResponse(true, 'Logs de auditoría obtenidos exitosamente', response)
    );

  } catch (error) {
    console.error('Error obteniendo logs de auditoría:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Dashboard administrativo (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard obtenido exitosamente
 *       401:
 *         description: No autorizado
 */
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    // Obtener estadísticas generales
    const totalPoliticians = await Politician.countDocuments({ isActive: true });
    const totalCandidates = await Politician.countDocuments({ isActive: true, isCandidato: true });
    const totalRepresentatives = await Politician.countDocuments({ isActive: true, isCandidato: false });
    const totalReferidos = await Referido.countDocuments({ isActive: true });
    const totalAuditLogs = await AuditLog.countDocuments();

    // Obtener últimos logs de auditoría
    const recentLogs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select('action entityType entityId timestamp')
      .lean(); // Usar lean() para objetos planos de JavaScript

    // Obtener políticos sin email configurado
    const politiciansWithoutEmail = await Politician.find({
      $or: [
        { email: { $exists: false } },
        { email: { $in: [null, '', undefined] } }
      ],
      isActive: true
    }).select('uuid nombres apellidos isCandidato')
      .lean(); // Usar lean() para objetos planos de JavaScript

    // Transformar logs recientes para incluir solo id
    const transformedRecentLogs = recentLogs.map(log => ({
      id: log._id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      timestamp: log.timestamp
    }));

    // Transformar políticos sin email para incluir solo id
    const transformedPoliticiansWithoutEmail = politiciansWithoutEmail.map(politician => ({
      id: politician._id,
      uuid: politician.uuid,
      nombres: politician.nombres,
      apellidos: politician.apellidos,
      isCandidato: politician.isCandidato,
      nombreCompleto: `${politician.nombres} ${politician.apellidos}`
    }));

    const dashboard = {
      statistics: {
        totalPoliticians,
        totalCandidates,
        totalRepresentatives,
        totalReferidos,
        totalAuditLogs
      },
      recentLogs: transformedRecentLogs,
      politiciansWithoutEmail: transformedPoliticiansWithoutEmail,
      lastUpdated: new Date()
    };

    res.status(200).json(
      createApiResponse(true, 'Dashboard administrativo obtenido exitosamente', dashboard)
    );

  } catch (error) {
    console.error('Error obteniendo dashboard administrativo:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};
