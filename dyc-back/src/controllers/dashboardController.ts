import { Request, Response } from 'express';
import { Politician } from '../models/Politician';
import { Referido } from '../models/Referido';
import { AuditLog, AuditAction, EntityType } from '../models/AuditLog';
import { createApiResponse, generateUUID, getClientIP, getUserAgent } from '../utils/helpers';

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
 *       401:
 *         description: No autenticado
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    const politicianId = req.user.uuid;

    // Obtener información del político
    const politician = await Politician.findOne({ 
      uuid: politicianId, 
      isActive: true 
    }).select('nombres apellidos isCandidato fotoPerfil')
      .lean(); // Usar lean() para objetos planos de JavaScript

    if (!politician) {
      return res.status(404).json(
        createApiResponse(false, 'Político no encontrado', null, 'POLITICIAN_NOT_FOUND')
      );
    }

    // Obtener estadísticas de referidos
    const [totalReferidos, referidosRecientes, referidosPorMes] = await Promise.all([
      Referido.countDocuments({ politicianId, isActive: true }),
      Referido.find({ politicianId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('nombres apellidos numeroTelefono documentoIdentidad createdAt')
        .lean(), // Usar lean() para objetos planos de JavaScript
      Referido.aggregate([
        { $match: { politicianId, isActive: true } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);

    // Obtener actividad reciente
    const actividadReciente = await AuditLog.find({
      userId: politicianId,
      entityType: { $in: [EntityType.POLITICIAN, EntityType.REFERIDO] }
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('action entityType entityId timestamp details')
      .lean(); // Usar lean() para objetos planos de JavaScript

    // Transformar referidos recientes para incluir solo id
    const transformedReferidosRecientes = referidosRecientes.map(referido => ({
      id: referido._id,
      nombres: referido.nombres,
      apellidos: referido.apellidos,
      numeroTelefono: referido.numeroTelefono,
      documentoIdentidad: referido.documentoIdentidad
    }));

    // Transformar actividad reciente para incluir solo id
    const transformedActividadReciente = actividadReciente.map(actividad => ({
      id: actividad._id,
      action: actividad.action,
      entityType: actividad.entityType,
      entityId: actividad.entityId,
      timestamp: actividad.timestamp,
      details: actividad.details
    }));

    const dashboard = {
      politician: {
        id: politician._id,
        uuid: politician.uuid,
        nombres: politician.nombres,
        apellidos: politician.apellidos,
        isCandidato: politician.isCandidato,
        fotoPerfil: politician.fotoPerfil
      },
      estadisticas: {
        totalReferidos,
        referidosRecientes: referidosRecientes.length,
        referidosPorMes: referidosPorMes.map(item => ({
          mes: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          cantidad: item.count
        }))
      },
      referidosRecientes: transformedReferidosRecientes,
      actividadReciente: transformedActividadReciente
    };

    res.status(200).json(
      createApiResponse(true, 'Dashboard obtenido exitosamente', dashboard)
    );

  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

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
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo representantes)
 */
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
export const getReferidos = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    const politicianId = req.user.uuid;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Obtener total de referidos
    const totalReferidos = await Referido.countDocuments({ 
      politicianId, 
      isActive: true 
    });

    // Obtener referidos con paginación
    const referidos = await Referido.find({ 
      politicianId, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('nombres apellidos email numeroTelefono documentoIdentidad createdAt')
      .lean();

    // Calcular información de paginación
    const totalPages = Math.ceil(totalReferidos / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const pagination = {
      page,
      limit,
      total: totalReferidos,
      totalPages,
      hasNext,
      hasPrev
    };

    // Transformar referidos para incluir solo id
    const transformedReferidos = referidos.map(referido => ({
      id: referido._id,
      nombres: referido.nombres,
      apellidos: referido.apellidos,
      email: referido.email,
      numeroTelefono: referido.numeroTelefono,
      documentoIdentidad: referido.documentoIdentidad,
      createdAt: referido.createdAt
    }));

    res.status(200).json(
      createApiResponse(true, 'Referidos obtenidos exitosamente', {
        referidos: transformedReferidos,
        pagination
      })
    );

  } catch (error) {
    console.error('Error obteniendo referidos:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

export const getRepresentativeDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    // Solo representantes pueden acceder
    if (req.user.isCandidato) {
      return res.status(403).json(
        createApiResponse(false, 'Solo representantes pueden acceder a este dashboard', null, 'REPRESENTATIVE_REQUIRED')
      );
    }

    // Obtener estadísticas generales
    const [totalPoliticians, totalCandidates, totalRepresentatives, totalReferidos, referidosPorPolitico] = await Promise.all([
      Politician.countDocuments({ isActive: true }),
      Politician.countDocuments({ isActive: true, isCandidato: true }),
      Politician.countDocuments({ isActive: true, isCandidato: false }),
      Referido.countDocuments({ isActive: true }),
      Referido.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$politicianId',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'politicians',
            localField: '_id',
            foreignField: 'uuid',
            as: 'politician'
          }
        },
        {
          $project: {
            politicianId: '$_id',
            politicianName: { $concat: ['$politician.nombres', ' ', '$politician.apellidos'] },
            count: 1
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Obtener actividad reciente del sistema
    const actividadSistema = await AuditLog.find({
      entityType: { $in: [EntityType.POLITICIAN, EntityType.REFERIDO] }
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('userId', 'nombres apellidos')
      .select('action entityType entityId userId timestamp details')
      .lean(); // Usar lean() para objetos planos de JavaScript

    // Transformar actividad del sistema para incluir solo id y manejar campos populados
    const transformedActividadSistema = actividadSistema.map((actividad: any) => ({
      id: actividad._id,
      action: actividad.action,
      entityType: actividad.entityType,
      entityId: actividad.entityId,
      timestamp: actividad.timestamp,
      details: actividad.details,
      // Incluir información del usuario si está populado
      ...(actividad.userId && typeof actividad.userId === 'object' && {
        user: {
          id: actividad.userId._id,
          nombres: actividad.userId.nombres,
          apellidos: actividad.userId.apellidos,
          nombreCompleto: `${actividad.userId.nombres} ${actividad.userId.apellidos}`
        }
      })
    }));

    const dashboard = {
      estadisticasGenerales: {
        totalPoliticians,
        totalCandidates,
        totalRepresentatives,
        totalReferidos
      },
      referidosPorPolitico,
      actividadSistema: transformedActividadSistema
    };

    res.status(200).json(
      createApiResponse(true, 'Dashboard de representante obtenido exitosamente', dashboard)
    );

  } catch (error) {
    console.error('Error obteniendo dashboard de representante:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};
