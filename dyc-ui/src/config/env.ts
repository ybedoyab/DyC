// Configuración de variables de entorno para el frontend
export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  PORT: import.meta.env.VITE_PORT || '3000',
  NODE_ENV: import.meta.env.MODE || 'development'
};

// Función para obtener la URL de la API
export const getApiUrl = () => config.API_URL;

// Función para obtener el puerto
export const getPort = () => config.PORT;

// Función para verificar si estamos en desarrollo
export const isDevelopment = () => config.NODE_ENV === 'development';
