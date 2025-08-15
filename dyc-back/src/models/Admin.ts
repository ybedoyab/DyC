import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  uuid: string;
  username: string;
  email: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date
  },
  permissions: [{
    type: String,
    enum: [
      'manage_politicians',
      'manage_referidos',
      'view_audit_logs',
      'view_statistics',
      'system_admin'
    ],
    default: ['system_admin']
  }]
}, {
  timestamps: true,
  collection: 'admins'
});

// Índices
AdminSchema.index({ username: 1, isActive: 1 });
AdminSchema.index({ email: 1, isActive: 1 });

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
