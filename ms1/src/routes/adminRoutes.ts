import { Router } from 'express';
import adminAuthRoutes from './adminAuthRoutes';
import adminStatsRoutes from './adminStatsRoutes';
import adminClientsRoutes from './adminClientsRoutes';
import adminJobsRoutes from './adminJobsRoutes';
import adminSystemRoutes from './adminSystemRoutes';

const router = Router();

router.use('/auth', adminAuthRoutes);
router.use('/stats', adminStatsRoutes);
router.use('/clients', adminClientsRoutes);
router.use('/jobs', adminJobsRoutes);
router.use('/system', adminSystemRoutes);

export default router;
