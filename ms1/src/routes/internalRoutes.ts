import { Router } from 'express';
import * as internalController from '../controllers/internalController';
import { internalAuthMiddleware } from '../middlewares/internalAuthMiddleware';

const router = Router();

router.use(internalAuthMiddleware);
router.post('/result', internalController.handleResult);

export default router;
