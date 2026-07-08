import { Router } from 'express';
import * as pollController from '../controllers/pollController';
import { authenticateApiKey } from '../middlewares/authenticateApiKey';

const router = Router();

router.use(authenticateApiKey);
router.get('/:trackingId', pollController.getStatus);

export default router;
