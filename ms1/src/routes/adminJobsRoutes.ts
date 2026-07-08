import { Router } from 'express';
import * as adminJobsController from '../controllers/adminJobsController';
import { authenticateAdmin } from '../middlewares/authenticateAdmin';

const router = Router();

router.use(authenticateAdmin);

router.get('/', adminJobsController.listJobs);
router.get('/export', adminJobsController.exportJobs);
router.get('/:trackingId', adminJobsController.getJob);
router.post('/:trackingId/retry-webhook', adminJobsController.retryWebhook);

export default router;
