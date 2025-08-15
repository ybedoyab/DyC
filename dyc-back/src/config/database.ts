import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dyc-db';

export const connectDB = async (): Promise<void> => {
  try {
    // Opciones de conexión para MongoDB Atlas
    const options = {
      maxPoolSize: 10, // Máximo de conexiones en el pool
      serverSelectionTimeoutMS: 5000, // Timeout para selección de servidor
      socketTimeoutMS: 45000, // Timeout para operaciones de socket
      bufferCommands: false, // Deshabilitar buffering de comandos
    };

    await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ MongoDB Atlas conectado exitosamente');
    console.log(`📊 Base de datos: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Puerto: ${mongoose.connection.port}`);
    
    // Eventos de conexión
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose conectado a MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de conexión Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔴 Mongoose desconectado de MongoDB');
    });

  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('🔌 MongoDB desconectado');
  } catch (error) {
    console.error('❌ Error desconectando MongoDB:', error);
  }
};

// Función para verificar el estado de la conexión
export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[mongoose.connection.readyState as keyof typeof states],
    readyState: mongoose.connection.readyState,
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  };
};
