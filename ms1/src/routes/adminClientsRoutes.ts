import { Router } from 'express';
import * as adminClientsController from '../controllers/adminClientsController';
import { authenticateAdmin } from '../middlewares/authenticateAdmin';

const router = Router();

router.use(authenticateAdmin);

router.get('/', adminClientsController.listClients);
router.get('/:clientId', adminClientsController.getClient);
router.patch('/:clientId/plan', adminClientsController.updateClientPlan);

export default router;
