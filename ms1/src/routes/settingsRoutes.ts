import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import { authenticateJwt } from '../middlewares/authenticateJwt';

const router = Router();

router.use(authenticateJwt);
router.post('/webhook', settingsController.updateWebhook);
router.get('/profile', settingsController.getProfile);

export default router;
