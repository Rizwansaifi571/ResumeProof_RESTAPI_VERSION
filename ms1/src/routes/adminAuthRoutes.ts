import { Router } from 'express';
import * as adminAuthController from '../controllers/adminAuthController';
import { authenticateAdmin } from '../middlewares/authenticateAdmin';

const router = Router();

router.post('/login', adminAuthController.login);
router.post('/refresh', adminAuthController.refresh);
router.post('/logout', authenticateAdmin, adminAuthController.logout);
router.get('/me', authenticateAdmin, adminAuthController.me);

export default router;
