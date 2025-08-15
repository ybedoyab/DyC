import { Request, Response } from 'express';
import { Referido } from '../models/Referido';
import { Politician } from '../models/Politician';
import { AuditLog, AuditAction, EntityType } from '../models/AuditLog';
import { createApiResponse, generateUUID, getClientIP, getUserAgent, validateEmail, validatePhoneNumber, validateDocumentId } from '../utils/helpers';

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
 *             $ref: '#/components/schemas/CreateReferidoRequest'
 *     responses:
 *       201:
 *         description: Referido creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
export const createReferido = async (req: Request, res: Response) => {
  try {
    const { nombres, apellidos, email, numeroTelefono, documentoIdentidad, politicianId } = req.body;

    // Validaciones
    if (!nombres || nombres.trim().length === 0) {
      return res.status(400).json(
        createApiResponse(false, 'Nombres son requeridos', null, 'NAMES_REQUIRED')
      );
    }

    if (!apellidos || apellidos.trim().length === 0) {
      return res.status(400).json(
        createApiResponse(false, 'Apellidos son requeridos', null, 'SURNAMES_REQUIRED')
      );
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json(
        createApiResponse(false, 'Email válido es requerido', null, 'INVALID_EMAIL')
      );
    }

    if (!documentoIdentidad || !validateDocumentId(documentoIdentidad)) {
      return res.status(400).json(
        createApiResponse(false, 'Documento de identidad válido es requerido', null, 'INVALID_DOCUMENT')
      );
    }

    if (!politicianId) {
      return res.status(400).json(
        createApiResponse(false, 'ID del político es requerido', null, 'POLITICIAN_ID_REQUIRED')
      );
    }

    if (numeroTelefono && !validatePhoneNumber(numeroTelefono)) {
      return res.status(400).json(
        createApiResponse(false, 'Número telefónico inválido', null, 'INVALID_PHONE')
      );
    }

    // Verificar que el político existe
    const politician = await Politician.findOne({ uuid: politicianId, isActive: true });
    if (!politician) {
      return res.status(404).json(
        createApiResponse(false, 'Político no encontrado', null, 'POLITICIAN_NOT_FOUND')
      );
    }

    // Verificar que el email no esté duplicado
    const existingReferido = await Referido.findOne({ email: email.toLowerCase() });
    if (existingReferido) {
      return res.status(400).json(
        createApiResponse(false, 'Ya existe un referido con este email', null, 'EMAIL_ALREADY_EXISTS')
      );
    }

    // Verificar que el documento no esté duplicado
    const existingDocument = await Referido.findOne({ documentoIdentidad });
    if (existingDocument) {
      return res.status(400).json(
        createApiResponse(false, 'Ya existe un referido con este documento', null, 'DOCUMENT_ALREADY_EXISTS')
      );
    }

    // Crear referido
    const referido = new Referido({
      uuid: generateUUID(),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: email.toLowerCase(),
      numeroTelefono: numeroTelefono?.trim(),
      documentoIdentidad,
      politicianId,
      createdBy: 'public_form'
    });

    await referido.save();

    // Registrar auditoría
    const auditLog = new AuditLog({
      uuid: generateUUID(),
      action: AuditAction.CREATE,
      entityType: EntityType.REFERIDO,
      entityId: referido.uuid,
      userId: politicianId,
      timestamp: new Date(),
      details: {
        method: 'public_form',
        politicianId,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req)
      },
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    });

    await auditLog.save();

    res.status(201).json(
      createApiResponse(true, 'Referido creado exitosamente', referido)
    );

  } catch (error) {
    console.error('Error creando referido:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Referidos obtenidos exitosamente
 *       401:
 *         description: No autenticado
 */
export const getMyReferidos = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [referidos, total] = await Promise.all([
      Referido.find({ 
        politicianId: req.user.uuid, 
        isActive: true 
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .lean(), // Usar lean() para objetos planos de JavaScript
      Referido.countDocuments({ 
        politicianId: req.user.uuid, 
        isActive: true 
      })
    ]);

    // Transformar referidos para incluir solo id
    const transformedReferidos = referidos.map(referido => ({
      id: referido._id,
      uuid: referido.uuid,
      nombres: referido.nombres,
      apellidos: referido.apellidos,
      numeroTelefono: referido.numeroTelefono,
      documentoIdentidad: referido.documentoIdentidad,
      email: referido.email,
      politicianId: referido.politicianId,
      nombreCompleto: `${referido.nombres} ${referido.apellidos}`
    }));

    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.status(200).json(
      createApiResponse(true, 'Referidos obtenidos exitosamente', {
        referidos: transformedReferidos,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
          hasNext: parseInt(page as string) < totalPages,
          hasPrev: parseInt(page as string) > 1
        }
      })
    );

  } catch (error) {
    console.error('Error obteniendo referidos:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: politicianId
 *         schema:
 *           type: string
 *         description: Filtrar por político específico
 *     responses:
 *       200:
 *         description: Referidos obtenidos exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo representantes)
 */
export const getAllReferidos = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    // Solo representantes pueden ver todos los referidos
    if (req.user.isCandidato) {
      return res.status(403).json(
        createApiResponse(false, 'Solo representantes pueden ver todos los referidos', null, 'REPRESENTATIVE_REQUIRED')
      );
    }

    const { page = 1, limit = 10, politicianId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const filter: any = { isActive: true };
    if (politicianId) {
      filter.politicianId = politicianId;
    }

    const [referidos, total] = await Promise.all([
      Referido.find(filter)
        .populate('politicianId', 'nombres apellidos isCandidato')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .lean(), // Usar lean() para objetos planos de JavaScript
      Referido.countDocuments(filter)
    ]);

    // Transformar referidos para incluir solo id
    const transformedReferidos = referidos.map((referido: any) => ({
      id: referido._id,
      uuid: referido.uuid,
      nombres: referido.nombres,
      apellidos: referido.apellidos,
      numeroTelefono: referido.numeroTelefono,
      documentoIdentidad: referido.documentoIdentidad,
      email: referido.email,
      politicianId: referido.politicianId,
      nombreCompleto: `${referido.nombres} ${referido.apellidos}`,
      // Incluir información del político si está populado
      politician: {
        id: referido.politicianId._id,
        nombres: referido.politicianId.nombres,
        apellidos: referido.politicianId.apellidos,
        isCandidato: referido.politicianId.isCandidato,
        nombreCompleto: `${referido.politicianId.nombres} ${referido.politicianId.apellidos}`
      }
    }));

    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.status(200).json(
      createApiResponse(true, 'Referidos obtenidos exitosamente', {
        referidos: transformedReferidos,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
          hasNext: parseInt(page as string) < totalPages,
          hasPrev: parseInt(page as string) > 1
        }
      })
    );

  } catch (error) {
    console.error('Error obteniendo todos los referidos:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReferidoRequest'
 *     responses:
 *       200:
 *         description: Referido actualizado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Referido no encontrado
 */
export const updateReferido = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    const { uuid } = req.params;
    const { nombres, apellidos, email, numeroTelefono } = req.body;

    // Buscar referido
    const referido = await Referido.findOne({ uuid, isActive: true });
    if (!referido) {
      return res.status(404).json(
        createApiResponse(false, 'Referido no encontrado', null, 'REFERIDO_NOT_FOUND')
      );
    }

    // Verificar que el político autenticado sea el dueño del referido
    if (referido.politicianId !== req.user.uuid) {
      return res.status(403).json(
        createApiResponse(false, 'No autorizado para modificar este referido', null, 'NOT_AUTHORIZED')
      );
    }

    // Validaciones
    if (nombres && nombres.trim().length === 0) {
      return res.status(400).json(
        createApiResponse(false, 'Nombres no pueden estar vacíos', null, 'INVALID_NAMES')
      );
    }

    if (apellidos && apellidos.trim().length === 0) {
      return res.status(400).json(
        createApiResponse(false, 'Apellidos no pueden estar vacíos', null, 'INVALID_SURNAMES')
      );
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json(
        createApiResponse(false, 'Email inválido', null, 'INVALID_EMAIL')
      );
    }

    if (numeroTelefono && !validatePhoneNumber(numeroTelefono)) {
      return res.status(400).json(
        createApiResponse(false, 'Número telefónico inválido', null, 'INVALID_PHONE')
      );
    }

    // Verificar email duplicado si se está cambiando
    if (email && email.toLowerCase() !== referido.email) {
      const existingReferido = await Referido.findOne({ 
        email: email.toLowerCase(), 
        uuid: { $ne: uuid } 
      });
      if (existingReferido) {
        return res.status(400).json(
          createApiResponse(false, 'Ya existe un referido con este email', null, 'EMAIL_ALREADY_EXISTS')
        );
      }
    }

    // Actualizar campos
    if (nombres) referido.nombres = nombres.trim();
    if (apellidos) referido.apellidos = apellidos.trim();
    if (email) referido.email = email.toLowerCase();
    if (numeroTelefono !== undefined) referido.numeroTelefono = numeroTelefono;

    referido.updatedBy = req.user.uuid;
    await referido.save();

    // Registrar auditoría
    const auditLog = new AuditLog({
      uuid: generateUUID(),
      action: AuditAction.UPDATE,
      entityType: EntityType.REFERIDO,
      entityId: referido.uuid,
      userId: req.user.uuid,
      timestamp: new Date(),
      details: {
        method: 'referido_update',
        updatedFields: Object.keys(req.body),
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req)
      },
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    });

    await auditLog.save();

    res.status(200).json(
      createApiResponse(true, 'Referido actualizado exitosamente', referido)
    );

  } catch (error) {
    console.error('Error actualizando referido:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

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
export const deleteReferido = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    const { uuid } = req.params;

    // Buscar referido
    const referido = await Referido.findOne({ uuid, isActive: true });
    if (!referido) {
      return res.status(404).json(
        createApiResponse(false, 'Referido no encontrado', null, 'REFERIDO_NOT_FOUND')
      );
    }

    // Verificar que el político autenticado sea el dueño del referido
    if (referido.politicianId !== req.user.uuid) {
      return res.status(403).json(
        createApiResponse(false, 'No autorizado para eliminar este referido', null, 'NOT_AUTHORIZED')
      );
    }

    // Eliminar lógicamente
    referido.isActive = false;
    referido.updatedBy = req.user.uuid;
    await referido.save();

    // Registrar auditoría
    const auditLog = new AuditLog({
      uuid: generateUUID(),
      action: AuditAction.DELETE,
      entityType: EntityType.REFERIDO,
      entityId: referido.uuid,
      userId: req.user.uuid,
      timestamp: new Date(),
      details: {
        method: 'referido_delete',
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req)
      },
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    });

    await auditLog.save();

    res.status(200).json(
      createApiResponse(true, 'Referido eliminado exitosamente')
    );

  } catch (error) {
    console.error('Error eliminando referido:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};
