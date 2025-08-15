import { Request, Response } from 'express';
import { Politician } from '../models/Politician';
import { AuditLog, AuditAction, EntityType } from '../models/AuditLog';
import { createApiResponse, generateUUID, getClientIP, getUserAgent, validateEmail, validatePhoneNumber, validateDocumentId } from '../utils/helpers';

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
 *       401:
 *         description: No autenticado
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    console.log('PoliticianController - getProfile - req.user:', req.user);
    console.log('PoliticianController - getProfile - req.user.uuid:', req.user?.uuid);
    
    if (!req.user || !req.user.uuid) {
      console.log('PoliticianController - getProfile - Usuario no autenticado');
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    const politician = await Politician.findOne({ 
      uuid: req.user.uuid, 
      isActive: true 
    }).lean(); // Usar lean() para objetos planos de JavaScript

    if (!politician) {
      return res.status(404).json(
        createApiResponse(false, 'Político no encontrado', null, 'POLITICIAN_NOT_FOUND')
      );
    }

    // Transformar los datos para incluir solo id y campos calculados
    const transformedPolitician = {
      id: politician._id,
      uuid: politician.uuid,
      nombres: politician.nombres,
      apellidos: politician.apellidos,
      edad: politician.edad,
      sexo: politician.sexo,
      numeroTelefono: politician.numeroTelefono,
      documentoIdentidad: politician.documentoIdentidad,
      biografia: politician.biografia,
      fotoPerfil: politician.fotoPerfil,
      fotoCuerpoCompleto: politician.fotoCuerpoCompleto,
      fotoPortada: politician.fotoPortada,
      isCandidato: politician.isCandidato,
      isActive: politician.isActive,
      email: politician.email,
      oauthProvider: politician.oauthProvider,
      oauthId: politician.oauthId,
      nombreCompleto: `${politician.nombres} ${politician.apellidos}`,
      rol: politician.isCandidato ? 'Candidato' : 'Representante'
    };

    res.status(200).json(
      createApiResponse(true, 'Perfil obtenido exitosamente', transformedPolitician)
    );

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

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
 *             $ref: '#/components/schemas/UpdatePoliticianRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uuid) {
      return res.status(401).json(
        createApiResponse(false, 'No autenticado', null, 'NOT_AUTHENTICATED')
      );
    }

    // Obtener datos del body (texto)
    const { nombres, apellidos, edad, sexo, numeroTelefono, biografia, documentoIdentidad } = req.body;
    
    // Obtener archivos subidos
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

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

    if (edad && (edad < 18 || edad > 120)) {
      return res.status(400).json(
        createApiResponse(false, 'Edad debe estar entre 18 y 120 años', null, 'INVALID_AGE')
      );
    }

    if (sexo && !['masculino', 'femenino', 'no binario', 'otro'].includes(sexo)) {
      return res.status(400).json(
        createApiResponse(false, 'Sexo inválido', null, 'INVALID_SEX')
      );
    }

    if (numeroTelefono && !validatePhoneNumber(numeroTelefono)) {
      return res.status(400).json(
        createApiResponse(false, 'Número telefónico inválido', null, 'INVALID_PHONE')
      );
    }

    // Buscar y actualizar político
    const politician = await Politician.findOne({ 
      uuid: req.user.uuid, 
      isActive: true 
    });

    if (!politician) {
      return res.status(404).json(
        createApiResponse(false, 'Político no encontrado', null, 'POLITICIAN_NOT_FOUND')
      );
    }

    // Actualizar campos de texto
    if (nombres) politician.nombres = nombres.trim();
    if (apellidos) politician.apellidos = apellidos.trim();
    if (edad !== undefined) politician.edad = edad;
    if (sexo) politician.sexo = sexo;
    if (numeroTelefono !== undefined) politician.numeroTelefono = numeroTelefono;
    if (documentoIdentidad !== undefined) politician.documentoIdentidad = documentoIdentidad;
    if (biografia !== undefined) politician.biografia = biografia;
    
    // Actualizar campos de fotos con URLs de archivos subidos
    if (files.fotoPerfil && files.fotoPerfil[0]) {
      politician.fotoPerfil = `/uploads/${files.fotoPerfil[0].filename}`;
    }
    if (files.fotoCuerpoCompleto && files.fotoCuerpoCompleto[0]) {
      politician.fotoCuerpoCompleto = `/uploads/${files.fotoCuerpoCompleto[0].filename}`;
    }
    if (files.fotoPortada && files.fotoPortada[0]) {
      politician.fotoPortada = `/uploads/${files.fotoPortada[0].filename}`;
    }

    politician.updatedBy = req.user.uuid;
    await politician.save();

    // Registrar auditoría
    const auditLog = new AuditLog({
      uuid: generateUUID(),
      action: AuditAction.UPDATE,
      entityType: EntityType.POLITICIAN,
      entityId: politician.uuid,
      userId: req.user.uuid,
      timestamp: new Date(),
      details: {
        method: 'profile_update',
        updatedFields: Object.keys(req.body),
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req)
      },
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    });

    await auditLog.save();

    // Transformar los datos para incluir solo id y campos calculados
    const transformedPolitician = {
      id: politician._id,
      uuid: politician.uuid,
      nombres: politician.nombres,
      apellidos: politician.apellidos,
      edad: politician.edad,
      sexo: politician.sexo,
      numeroTelefono: politician.numeroTelefono,
      documentoIdentidad: politician.documentoIdentidad,
      biografia: politician.biografia,
      fotoPerfil: politician.fotoPerfil,
      fotoCuerpoCompleto: politician.fotoCuerpoCompleto,
      fotoPortada: politician.fotoPortada,
      isCandidato: politician.isCandidato,
      isActive: politician.isActive,
      email: politician.email,
      oauthProvider: politician.oauthProvider,
      oauthId: politician.oauthId,
      nombreCompleto: `${politician.nombres} ${politician.apellidos}`,
      rol: politician.isCandidato ? 'Candidato' : 'Representante'
    };

    res.status(200).json(
      createApiResponse(true, 'Perfil actualizado exitosamente', transformedPolitician)
    );

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

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
 *     responses:
 *       200:
 *         description: Perfil público obtenido exitosamente
 *       404:
 *         description: Político no encontrado
 */
export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;

    const politician = await Politician.findOne({ 
      uuid, 
      isActive: true 
    }).select('nombres apellidos edad sexo biografia fotoPerfil fotoCuerpoCompleto fotoPortada isCandidato createdAt')
      .lean(); // Usar lean() para objetos planos de JavaScript

    if (!politician) {
      return res.status(404).json(
        createApiResponse(false, 'Político no encontrado', null, 'POLITICIAN_NOT_FOUND')
      );
    }

    // Transformar los datos para incluir solo id y campos calculados
    const transformedPolitician = {
      id: politician._id,
      nombres: politician.nombres,
      apellidos: politician.apellidos,
      edad: politician.edad,
      sexo: politician.sexo,
      biografia: politician.biografia,
      fotoPerfil: politician.fotoPerfil,
      fotoCuerpoCompleto: politician.fotoCuerpoCompleto,
      fotoPortada: politician.fotoPortada,
      isCandidato: politician.isCandidato,
      nombreCompleto: `${politician.nombres} ${politician.apellidos}`,
      rol: politician.isCandidato ? 'Candidato' : 'Representante'
    };

    res.status(200).json(
      createApiResponse(true, 'Perfil público obtenido exitosamente', transformedPolitician)
    );

  } catch (error) {
    console.error('Error obteniendo perfil público:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};

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
 */
export const getPoliticians = async (req: Request, res: Response) => {
  try {
    const { isCandidato, page = 1, limit = 10 } = req.query;
    
    const filter: any = { isActive: true };
    if (isCandidato !== undefined) {
      filter.isCandidato = isCandidato === 'true';
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const [politicians, total] = await Promise.all([
      Politician.find(filter)
        .select('nombres apellidos edad sexo biografia fotoPerfil isCandidato createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .lean(), // Usar lean() para objetos planos de JavaScript
      Politician.countDocuments(filter)
    ]);

    // Transformar los datos para incluir solo id y campos calculados
    const transformedPoliticians = politicians.map(politician => ({
      id: politician._id,
      nombres: politician.nombres,
      apellidos: politician.apellidos,
      edad: politician.edad,
      sexo: politician.sexo,
      biografia: politician.biografia,
      fotoPerfil: politician.fotoPerfil,
      isCandidato: politician.isCandidato,
      nombreCompleto: `${politician.nombres} ${politician.apellidos}`,
      rol: politician.isCandidato ? 'Candidato' : 'Representante'
    }));

    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.status(200).json(
      createApiResponse(true, 'Políticos obtenidos exitosamente', {
        politicians: transformedPoliticians,
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
    console.error('Error obteniendo políticos:', error);
    res.status(500).json(
      createApiResponse(false, 'Error interno del servidor', null, 'INTERNAL_ERROR')
    );
  }
};
