import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSession extends Document {
  uuid: string;
  politicianId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

const UserSessionSchema = new Schema<IUserSession>({
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  politicianId: {
    type: String,
    required: true,
    index: true,
    ref: 'Politician'
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'user_sessions'
});

// Índices compuestos
UserSessionSchema.index({ politicianId: 1, isActive: 1 });
UserSessionSchema.index({ expiresAt: 1, isActive: 1 });

// Método para verificar si la sesión ha expirado
UserSessionSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

// Método para actualizar última actividad
UserSessionSchema.methods.updateActivity = function(): void {
  this.lastActivity = new Date();
};

export const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);
