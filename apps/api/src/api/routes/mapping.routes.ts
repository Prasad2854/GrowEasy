import { Router } from 'express';
import { handleAiMapping } from '../controllers/mapping.controller';

const router = Router();

router.post('/', handleAiMapping);

export { router as mappingRouter };
