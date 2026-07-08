import { Router } from 'express';
import * as usageController from '../controllers/usageController';
import { authenticateJwt } from '../middlewares/authenticateJwt';

const router = Router();

router.use(authenticateJwt);
router.get('/', usageController.getUsage);

export default router;
