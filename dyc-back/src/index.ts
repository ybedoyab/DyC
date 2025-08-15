import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import './types'; // Import types to ensure they are loaded
import { connectDB, disconnectDB, getDBStatus } from './config/database';
import { specs } from './config/swagger';
import passportConfig from './config/passport';
import oauthRoutes from './routes/oauth';
import adminRoutes from './routes/admin';
import politicianRoutes from './routes/politicians';
import referidoRoutes from './routes/referidos';
import dashboardRoutes from './routes/dashboard';
import statisticsRoutes from './routes/statistics';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Permitir cualquier origen
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'dyc_session_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Importar configuración de Passport (esto ejecuta la configuración automáticamente)
import './config/passport';

// Inicializar Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Swagger Documentation - Cambiado a /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rutas de la API
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/politicians', politicianRoutes);
app.use('/api/referidos', referidoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/statistics', statisticsRoutes);

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: '🚀 DYC Backend funcionando!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    apiUrl: API_URL
  });
});

// Ruta de salud de la base de datos
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbStatus = getDBStatus();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: 'Database health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Ruta de información del sistema
app.get('/info', (req: Request, res: Response) => {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    apiUrl: API_URL
  });
});

// Conectar a la base de datos y iniciar servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor DYC Backend...');
    console.log(`🌍 Puerto: ${PORT}`);
    console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API URL: ${API_URL}`);
    
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en ${API_URL}`);
      console.log(`📊 Base de datos: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/dyc-db'}`);
      console.log('🎯 Rutas disponibles:');
      console.log('   GET  / - Información del servidor');
      console.log('   GET  /health - Estado de la base de datos');
      console.log('   GET  /info - Información del sistema');
      console.log('   GET  /docs - Documentación Swagger');
      console.log('   POST /api/referidos - Crear referido (público)');
      console.log('   GET  /api/statistics - Estadísticas generales');
      console.log('   GET  /api/auth/oauth/google - Iniciar OAuth Google');
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
  await disconnectDB();
  process.exit(0);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
