// Script DDL para crear las colecciones de MongoDB
// Ejecutar con: node ddl/create_collections.js

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Usar la variable de entorno en lugar de hardcodear
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Error: MONGODB_URI no está definida en el archivo .env');
  process.exit(1);
}

async function createCollections() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');
    
    const db = client.db('dyc-db');
    
    // 1. Colección de Candidatos y Representantes
    await db.createCollection('politicians', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["uuid", "nombres", "apellidos", "documentoIdentidad", "isCandidato", "createdAt", "updatedAt"],
          properties: {
            uuid: { bsonType: "string" },
            nombres: { bsonType: "string", minLength: 1 },
            apellidos: { bsonType: "string", minLength: 1 },
            edad: { bsonType: "int", minimum: 18, maximum: 120 },
            sexo: { enum: ["masculino", "femenino", "no binario", "otro"] },
            email: { bsonType: "string", minLength: 1 },
            numeroTelefono: { bsonType: "string" },
            documentoIdentidad: { bsonType: "string", minLength: 1 },
            biografia: { bsonType: "string" },
            fotoPerfil: { bsonType: "string" },
            fotoCuerpoCompleto: { bsonType: "string" },
            fotoPortada: { bsonType: "string" },
            isCandidato: { bsonType: "bool", default: true },
            isActive: { bsonType: "bool", default: true },
            oauthProvider: { enum: ["google", "microsoft", "facebook"] },
            oauthId: { bsonType: "string" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
            createdBy: { bsonType: "string" },
            updatedBy: { bsonType: "string" }
          }
        }
      }
    });
    
    // Índices para politicians
    await db.collection('politicians').createIndex({ "uuid": 1 }, { unique: true });
    await db.collection('politicians').createIndex({ "documentoIdentidad": 1 }, { unique: true });
    await db.collection('politicians').createIndex({ "email": 1 }, { unique: true });
    await db.collection('politicians').createIndex({ "isCandidato": 1 });
    await db.collection('politicians').createIndex({ "isActive": 1 });
    
    console.log('✅ Colección "politicians" creada con índices');
    
    // 2. Colección de Usuarios Generales (Referidos)
    await db.createCollection('referidos', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["uuid", "nombres", "apellidos", "documentoIdentidad", "politicianId", "createdAt", "updatedAt"],
          properties: {
            uuid: { bsonType: "string" },
            nombres: { bsonType: "string", minLength: 1 },
            apellidos: { bsonType: "string", minLength: 1 },
            email: { bsonType: "string", minLength: 1 },
            numeroTelefono: { bsonType: "string" },
            documentoIdentidad: { bsonType: "string", minLength: 1 },
            politicianId: { bsonType: "string" },
            isActive: { bsonType: "bool", default: true },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
            createdBy: { bsonType: "string" },
            updatedBy: { bsonType: "string" }
          }
        }
      }
    });
    
    // Índices para referidos
    await db.collection('referidos').createIndex({ "uuid": 1 }, { unique: true });
    await db.collection('referidos').createIndex({ "documentoIdentidad": 1 }, { unique: true });
    await db.collection('referidos').createIndex({ "email": 1 }, { unique: true });
    await db.collection('referidos').createIndex({ "politicianId": 1 });
    await db.collection('referidos').createIndex({ "isActive": 1 });
    await db.collection('referidos').createIndex({ "createdAt": 1 });
    
    console.log('✅ Colección "referidos" creada con índices');
    
    // 3. Colección de Auditoría
    await db.createCollection('audit_logs', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["uuid", "action", "entityType", "entityId", "userId", "timestamp", "details"],
          properties: {
            uuid: { bsonType: "string" },
            action: { enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"] },
            entityType: { enum: ["politician", "referido", "user"] },
            entityId: { bsonType: "string" },
            userId: { bsonType: "string" },
            timestamp: { bsonType: "date" },
            details: { bsonType: "object" },
            ipAddress: { bsonType: "string" },
            userAgent: { bsonType: "string" }
          }
        }
      }
    });
    
    // Índices para audit_logs
    await db.collection('audit_logs').createIndex({ "uuid": 1 }, { unique: true });
    await db.collection('audit_logs').createIndex({ "entityType": 1, "entityId": 1 });
    await db.collection('audit_logs').createIndex({ "userId": 1 });
    await db.collection('audit_logs').createIndex({ "timestamp": 1 });
    await db.collection('audit_logs').createIndex({ "action": 1 });
    
    console.log('✅ Colección "audit_logs" creada con índices');
    
    // 4. Colección de Sesiones de Usuario
    await db.createCollection('user_sessions', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["uuid", "politicianId", "token", "expiresAt", "createdAt"],
          properties: {
            uuid: { bsonType: "string" },
            politicianId: { bsonType: "string" },
            token: { bsonType: "string" },
            expiresAt: { bsonType: "date" },
            ipAddress: { bsonType: "string" },
            userAgent: { bsonType: "string" },
            isActive: { bsonType: "bool", default: true },
            createdAt: { bsonType: "date" },
            lastActivity: { bsonType: "date" }
          }
        }
      }
    });
    
    // Índices para user_sessions
    await db.collection('user_sessions').createIndex({ "uuid": 1 }, { unique: true });
    await db.collection('user_sessions').createIndex({ "politicianId": 1 });
    await db.collection('user_sessions').createIndex({ "token": 1 }, { unique: true });
    await db.collection('user_sessions').createIndex({ "expiresAt": 1 });
    await db.collection('user_sessions').createIndex({ "isActive": 1 });
    
    console.log('✅ Colección "user_sessions" creada con índices');
    
    // 5. Colección de Administradores
    await db.createCollection('admins', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["uuid", "username", "email", "isActive", "permissions", "createdAt", "updatedAt"],
          properties: {
            uuid: { bsonType: "string" },
            username: { bsonType: "string", minLength: 3 },
            email: { bsonType: "string", minLength: 1 },
            isActive: { bsonType: "bool", default: true },
            lastLogin: { bsonType: "date" },
            permissions: { 
              bsonType: "array",
              items: { 
                enum: ["manage_politicians", "manage_referidos", "view_audit_logs", "view_statistics", "system_admin"] 
              }
            },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
          }
        }
      }
    });
    
    // Índices para admins
    await db.collection('admins').createIndex({ "uuid": 1 }, { unique: true });
    await db.collection('admins').createIndex({ "username": 1 }, { unique: true });
    await db.collection('admins').createIndex({ "email": 1 }, { unique: true });
    await db.collection('admins').createIndex({ "isActive": 1 });
    
    console.log('✅ Colección "admins" creada con índices');
    
    console.log('\n🎉 Todas las colecciones han sido creadas exitosamente!');
    console.log('\n📊 Resumen de colecciones:');
    console.log('   - politicians: Candidatos y representantes');
    console.log('   - referidos: Usuarios referidos por políticos');
    console.log('   - audit_logs: Registro de auditoría');
    console.log('   - user_sessions: Sesiones de usuario');
    console.log('   - admins: Administradores del sistema');
    
  } catch (error) {
    console.error('❌ Error creando colecciones:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

createCollections();
