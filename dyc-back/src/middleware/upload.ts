import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generar nombre único: timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Solo permitir imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 3 // Máximo 3 archivos por request
  }
});

// Middleware específico para fotos de perfil
export const uploadProfilePhotos = upload.fields([
  { name: 'fotoPerfil', maxCount: 1 },
  { name: 'fotoCuerpoCompleto', maxCount: 1 },
  { name: 'fotoPortada', maxCount: 1 }
]);

// Middleware para un solo archivo
export const uploadSinglePhoto = upload.single('photo');

export default upload;
