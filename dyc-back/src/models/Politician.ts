import mongoose, { Document, Schema } from 'mongoose';

export enum Sexo {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
  NO_BINARIO = 'no binario',
  OTRO = 'otro'
}

export interface IPolitician extends Document {
  uuid: string;
  nombres: string;
  apellidos: string;
  edad?: number;
  sexo?: Sexo;
  email: string;
  numeroTelefono?: string;
  documentoIdentidad: string;
  biografia?: string;
  fotoPerfil?: string;
  fotoCuerpoCompleto?: string;
  fotoPortada?: string;
  isCandidato: boolean;
  isActive: boolean;
  oauthProvider?: string;
  oauthId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

const PoliticianSchema = new Schema<IPolitician>({
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nombres: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  apellidos: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  edad: {
    type: Number,
    min: 18,
    max: 120
  },
  sexo: {
    type: String,
    enum: Object.values(Sexo)
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  numeroTelefono: {
    type: String,
    trim: true
  },
  documentoIdentidad: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  biografia: {
    type: String,
    trim: true
  },
  fotoPerfil: {
    type: String,
    trim: true
  },
  fotoCuerpoCompleto: {
    type: String,
    trim: true
  },
  fotoPortada: {
    type: String,
    trim: true
  },
  isCandidato: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  oauthProvider: {
    type: String,
    trim: true,
    enum: ['google', 'microsoft', 'facebook']
  },
  oauthId: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'politicians'
});

// Índices compuestos
PoliticianSchema.index({ isCandidato: 1, isActive: 1 });
PoliticianSchema.index({ nombres: 1, apellidos: 1 });

// Método virtual para nombre completo
PoliticianSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombres} ${this.apellidos}`;
});

// Método virtual para rol
PoliticianSchema.virtual('rol').get(function() {
  return this.isCandidato ? 'Candidato' : 'Representante';
});

// Configurar virtuals en JSON
PoliticianSchema.set('toJSON', { virtuals: true });
PoliticianSchema.set('toObject', { virtuals: true });

export const Politician = mongoose.model<IPolitician>('Politician', PoliticianSchema);
