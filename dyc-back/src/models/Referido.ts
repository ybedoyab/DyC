import mongoose, { Document, Schema } from 'mongoose';

export interface IReferido extends Document {
  uuid: string;
  nombres: string;
  apellidos: string;
  email: string;
  numeroTelefono?: string;
  documentoIdentidad: string;
  politicianId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

const ReferidoSchema = new Schema<IReferido>({
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
  politicianId: {
    type: String,
    required: true,
    index: true,
    ref: 'Politician'
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true
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
  collection: 'referidos'
});

// Índices compuestos
ReferidoSchema.index({ politicianId: 1, isActive: 1 });
ReferidoSchema.index({ createdAt: 1, isActive: 1 });

// Método virtual para nombre completo
ReferidoSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombres} ${this.apellidos}`;
});

// Configurar virtuals en JSON
ReferidoSchema.set('toJSON', { virtuals: true });
ReferidoSchema.set('toObject', { virtuals: true });

export const Referido = mongoose.model<IReferido>('Referido', ReferidoSchema);
