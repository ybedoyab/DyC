import { Request, Response } from 'express';
import { Politician } from '../models/Politician';
import { Referido } from '../models/Referido';
import { AuditLog, AuditAction, EntityType } from '../models/AuditLog';
import { createApiResponse } from '../utils/helpers';

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Obtener estadísticas generales del sistema
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
export const getStatistics = async (req: Request, res: Response) => {
  try {
    // Estadísticas básicas
    const [totalPoliticians, totalCandidates, totalRepresentatives, totalReferidos] = await Promise.all([
      Politician.countDocuments({ isActive: true }),
      Politician.countDocuments({ isActive: true, isCandidato: true }),
      Politician.countDocuments({ isActive: true, isCandidato: false }),
      Referido.countDocuments({ isActive: true })
    ]);

    // Referidos por político (top 10)
    const referidosPorPolitico = await Referido.aggregate([
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
          politicianName: { 
            $concat: [
              { $arrayElemAt: ['$politician.nombres', 0] }, 
              ' ', 
              { $arrayElemAt: ['$politician.apellidos', 0] }
            ]
          },
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Referidos por mes (últimos 12 meses)
    const referidosPorMes = await Referido.aggregate([
      { $match: { isActive: true } },
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
      { $limit: 12 }
    ]);

    // Actividad por tipo de entidad
    const actividadPorTipo = await AuditLog.aggregate([
      {
        $group: {
          _id: '$entityType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Actividad por acción
    const actividadPorAccion = await AuditLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Actividad reciente (últimas 24 horas)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const actividadReciente = await AuditLog.countDocuments({
      timestamp: { $gte: yesterday }
    });

    // Políticos sin email configurado
    const politicosSinEmail = await Politician.countDocuments({
      isActive: true,
      $or: [
        { email: { $exists: false } },
        { email: { $eq: null } },
        { email: { $eq: '' } }
      ]
    });

    const statistics = {
      resumen: {
        totalPoliticians,
        totalCandidates,
        totalRepresentatives,
        totalReferidos,
        politicosSinEmail
      },
      referidosPorPolitico,
      referidosPorMes: referidosPorMes.map(item => ({
        mes: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        cantidad: item.count
      })),
      actividad: {
        porTipo: actividadPorTipo,
        porAccion: actividadPorAccion,
        reciente24h: actividadReciente
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(
      createApiResponse(true, 'Estadísticas obtenidas exitosamente', statistics)
    );

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

/**
 * @swagger
 * /api/statistics/politicians:
 *   get:
 *     summary: Obtener estadísticas detalladas de políticos
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Estadísticas de políticos obtenidas exitosamente
 */
export const getPoliticiansStatistics = async (req: Request, res: Response) => {
  try {
    // Distribución por sexo
    const distribucionPorSexo = await Politician.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$sexo',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Distribución por edad
    const distribucionPorEdad = await Politician.aggregate([
      { $match: { isActive: true, edad: { $exists: true } } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$edad', 25] }, then: '18-24' },
                { case: { $lt: ['$edad', 35] }, then: '25-34' },
                { case: { $lt: ['$edad', 45] }, then: '35-44' },
                { case: { $lt: ['$edad', 55] }, then: '45-54' },
                { case: { $lt: ['$edad', 65] }, then: '55-64' }
              ],
              default: '65+'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Políticos con OAuth configurado
    const politicosConOAuth = await Politician.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$oauthProvider',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Políticos más activos (por auditoría)
    const politicosMasActivos = await AuditLog.aggregate([
      { $match: { entityType: EntityType.POLITICIAN } },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
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
          politicianName: { 
            $concat: [
              { $arrayElemAt: ['$politician.nombres', 0] }, 
              ' ', 
              { $arrayElemAt: ['$politician.apellidos', 0] }
            ]
          },
          count: 1
        }
      }
    ]);

    const statistics = {
      distribucionPorSexo,
      distribucionPorEdad,
      politicosConOAuth,
      politicosMasActivos,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(
      createApiResponse(true, 'Estadísticas de políticos obtenidas exitosamente', statistics)
    );

  } catch (error) {
    console.error('Error obteniendo estadísticas de políticos:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

/**
 * @swagger
 * /api/statistics/referidos:
 *   get:
 *     summary: Obtener estadísticas detalladas de referidos
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Estadísticas de referidos obtenidas exitosamente
 */
export const getReferidosStatistics = async (req: Request, res: Response) => {
  try {
    // Referidos por mes (últimos 24 meses)
    const referidosPorMes = await Referido.aggregate([
      { $match: { isActive: true } },
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
      { $limit: 24 }
    ]);

    // Referidos por día de la semana
    const referidosPorDiaSemana = await Referido.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Referidos por hora del día
    const referidosPorHora = await Referido.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top políticos por referidos
    const topPoliticosPorReferidos = await Referido.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$politicianId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
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
          politicianName: { 
            $concat: [
              { $arrayElemAt: ['$politician.nombres', 0] }, 
              ' ', 
              { $arrayElemAt: ['$politician.apellidos', 0] }
            ]
          },
          isCandidato: { $arrayElemAt: ['$politician.isCandidato', 0] },
          count: 1
        }
      }
    ]);

    const statistics = {
      referidosPorMes: referidosPorMes.map(item => ({
        mes: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        cantidad: item.count
      })),
      referidosPorDiaSemana,
      referidosPorHora,
      topPoliticosPorReferidos,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(
      createApiResponse(true, 'Estadísticas de referidos obtenidas exitosamente', statistics)
    );

  } catch (error) {
    console.error('Error obteniendo estadísticas de referidos:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};
