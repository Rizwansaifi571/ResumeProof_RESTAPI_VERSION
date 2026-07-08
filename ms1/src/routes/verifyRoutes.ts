import { Router } from 'express';
import * as verifyController from '../controllers/verifyController';
import { authenticateApiKey } from '../middlewares/authenticateApiKey';
import { enforceQuotaMiddleware } from '../middlewares/enforceQuotaMiddleware';
import { upload } from '../middlewares/multerUploadMiddleware';
import { validateVerifyRequestMiddleware } from '../middlewares/validateVerifyRequestMiddleware';

const router = Router();

router.use(authenticateApiKey);
router.post('/', enforceQuotaMiddleware, upload.single('resume'), validateVerifyRequestMiddleware, verifyController.submitVerification);

export default router;
