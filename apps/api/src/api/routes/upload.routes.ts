import { Router } from 'express';
import multer from 'multer';
import { handleUpload } from '../controllers/upload.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), handleUpload);

export { router as uploadRouter };
