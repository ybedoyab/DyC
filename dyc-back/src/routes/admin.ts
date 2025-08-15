import { Router } from 'express';
import { 
  adminLogin, 
  updatePoliticianEmail, 
  getAuditLogs, 
  getAdminDashboard 
} from '../controllers/adminController';
import { 
  authenticateAdmin, 
  requirePermission, 
  requireSystemAdmin 
} from '../middleware/adminAuth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints de administración del sistema
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login de administrador
 *     tags: [Admin]
 */
router.post('/login', adminLogin);

/**
 * @swagger
 * /api/admin/politicians/{uuid}/email:
 *   patch:
 *     summary: Actualizar email de político
 *     tags: [Admin]
 */
router.patch('/politicians/:uuid/email', 
  authenticateAdmin, 
  requirePermission('manage_politicians'), 
  updatePoliticianEmail
);

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Obtener logs de auditoría
 *     tags: [Admin]
 */
router.get('/audit-logs', 
  authenticateAdmin, 
  requirePermission('view_audit_logs'), 
  getAuditLogs
);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Dashboard administrativo
 *     tags: [Admin]
 */
router.get('/dashboard', 
  authenticateAdmin, 
  requireSystemAdmin, 
  getAdminDashboard
);

export default router;
