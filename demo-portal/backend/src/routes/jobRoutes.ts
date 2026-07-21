import { Router } from 'express';
import * as jobController from '../controllers/jobController';

const router = Router();

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

export default router;
