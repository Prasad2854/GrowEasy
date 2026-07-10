import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { parseCsvHeaders } from '../../services/csv.service';
import { randomUUID } from 'crypto';
import { ImportJobService } from '../../services/import-job.service';

export const handleUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { headers, sampleRows } = await parseCsvHeaders(req.file.path);
    
    // Create a new job
    const jobId = randomUUID();
    const job = ImportJobService.createJob(jobId, req.file.originalname, req.file.path, 0); // We'll update total rows later

    res.status(200).json({
      jobId,
      headers,
      sampleRows,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    logger.error({ err: error }, 'Error handling upload');
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
};
