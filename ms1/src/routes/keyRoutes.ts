import { Router } from 'express';
import * as keyController from '../controllers/keyController';
import { authenticateJwt } from '../middlewares/authenticateJwt';

const router = Router();

router.use(authenticateJwt);

router.post('/generate', keyController.generate);
router.get('/', keyController.list);
router.delete('/:keyId', keyController.revoke);

export default router;
