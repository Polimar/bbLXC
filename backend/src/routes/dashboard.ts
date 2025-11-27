import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { auth } from '../middleware/auth';
import { premiumAuth } from '../middleware/premiumAuth';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// FREE dashboard (accessible by all authenticated users)
router.get('/free', auth, DashboardController.getFreeDashboard);

// PREMIUM dashboard (accessible by PREMIUM and ADMIN users)
router.get('/premium', auth, premiumAuth, DashboardController.getPremiumDashboard);

// ADMIN dashboard (accessible only by ADMIN users)
router.get('/admin', auth, adminAuth, DashboardController.getAdminDashboard);

export default router;
