import { Router } from 'express';
import * as adminSystemController from '../controllers/adminSystemController';
import { authenticateAdmin } from '../middlewares/authenticateAdmin';

const router = Router();

router.use(authenticateAdmin);

router.get('/health', adminSystemController.getHealth);
router.get('/latency', adminSystemController.getLatencyHistory);
router.get('/audit-log', adminSystemController.getAuditLog);

export default router;
