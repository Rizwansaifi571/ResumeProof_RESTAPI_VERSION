import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateJwt } from '../middlewares/authenticateJwt';

const router = Router();

router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticateJwt, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
