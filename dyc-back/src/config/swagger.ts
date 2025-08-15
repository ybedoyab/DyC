import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DYC Backend API',
      version: '1.0.0',
      description: 'API para el partido político Dignidad y Compromiso (DYC)',
      contact: {
        name: 'DYC Development Team',
        email: 'dev@dyc.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Politician: {
          type: 'object',
          properties: {
            uuid: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            nombres: { type: 'string', example: 'Juan Carlos' },
            apellidos: { type: 'string', example: 'García López' },
            edad: { type: 'number', example: 35 },
            sexo: { type: 'string', enum: ['masculino', 'femenino', 'no binario', 'otro'] },
            email: { type: 'string', example: 'juan.garcia@dyc.com' },
            numeroTelefono: { type: 'string', example: '+57 300 123 4567' },
            documentoIdentidad: { type: 'string', example: '12345678' },
            biografia: { type: 'string', example: 'Político comprometido con el cambio social...' },
            fotoPerfil: { type: 'string', example: 'https://example.com/foto-perfil.jpg' },
            fotoCuerpoCompleto: { type: 'string', example: 'https://example.com/foto-cuerpo.jpg' },
            fotoPortada: { type: 'string', example: 'https://example.com/foto-portada.jpg' },
            isCandidato: { type: 'boolean', example: true },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Referido: {
          type: 'object',
          properties: {
            uuid: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            nombres: { type: 'string', example: 'María' },
            apellidos: { type: 'string', example: 'Rodríguez' },
            email: { type: 'string', example: 'maria.rodriguez@email.com' },
            numeroTelefono: { type: 'string', example: '+57 300 987 6543' },
            documentoIdentidad: { type: 'string', example: '87654321' },
            politicianId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['documentoIdentidad', 'password'],
          properties: {
            documentoIdentidad: { type: 'string', example: '12345678' },
            password: { type: 'string', example: 'password123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            politician: { $ref: '#/components/schemas/Politician' },
            expiresAt: { type: 'string', format: 'date-time' }
          }
        },
        StatisticsResponse: {
          type: 'object',
          properties: {
            totalPoliticians: { type: 'number', example: 9 },
            totalCandidates: { type: 'number', example: 7 },
            totalRepresentatives: { type: 'number', example: 2 },
            totalReferidos: { type: 'number', example: 150 },
            referidosByPolitician: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  politicianId: { type: 'string' },
                  politicianName: { type: 'string' },
                  count: { type: 'number' }
                }
              }
            },
            referidosByMonth: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string' },
                  count: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación'
      },
      {
        name: 'Politicians',
        description: 'Gestión de candidatos y representantes'
      },
      {
        name: 'Referidos',
        description: 'Gestión de usuarios referidos'
      },
      {
        name: 'Statistics',
        description: 'Estadísticas del partido'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard personal para políticos'
      },
      {
        name: 'Admin',
        description: 'Endpoints de administración del sistema'
      },
      {
        name: 'OAuth',
        description: 'Endpoints de autenticación OAuth con Google'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

export const specs = swaggerJsdoc(options);
