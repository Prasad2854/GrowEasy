import { Router } from 'express';
import { handleProcess, getJobStatus, getJobResult } from '../controllers/process.controller';

const router = Router();

router.post('/', handleProcess);
router.get('/:jobId/status', getJobStatus);
router.get('/:jobId/result', getJobResult);

export { router as processRouter };
