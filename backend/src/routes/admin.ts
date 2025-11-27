import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(auth, adminAuth);

// User management
router.get('/users', AdminController.getUsers);
router.put('/users/:id/role', AdminController.updateUserRole);
router.put('/users/:id/admin', AdminController.updateAdminStatus);
router.delete('/users/:id', AdminController.deleteUser);

// Statistics
router.get('/stats', AdminController.getStats);

export default router;
