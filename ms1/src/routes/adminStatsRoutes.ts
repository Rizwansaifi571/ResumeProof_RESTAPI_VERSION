import { Router } from 'express';
import * as adminStatsController from '../controllers/adminStatsController';
import { authenticateAdmin } from '../middlewares/authenticateAdmin';

const router = Router();

router.use(authenticateAdmin);

router.get('/summary', adminStatsController.getSummary);
router.get('/daily-jobs', adminStatsController.getDailyJobs);
router.get('/plan-distribution', adminStatsController.getPlanDistribution);
router.get('/queue', adminStatsController.getQueueStats);

export default router;
