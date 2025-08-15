import mongoose, { Document, Schema } from 'mongoose';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}

export enum EntityType {
  POLITICIAN = 'politician',
  REFERIDO = 'referido',
  USER = 'user',
  ADMIN = 'admin'
}

export interface IAuditLog extends Document {
  uuid: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: Object.values(AuditAction),
    index: true
  },
  entityType: {
    type: String,
    required: true,
    enum: Object.values(EntityType),
    index: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  details: {
    type: Schema.Types.Mixed,
    required: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'audit_logs'
});

// Índices compuestos
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ userId: 1, timestamp: 1 });
AuditLogSchema.index({ action: 1, timestamp: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
