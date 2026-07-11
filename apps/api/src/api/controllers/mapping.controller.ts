import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { generateMapping } from '../../services/ai.service';
import { ImportJobService } from '../../services/import-job.service';

export const handleAiMapping = async (req: Request, res: Response) => {
  try {
    const { jobId, headers, sampleRows } = req.body;

    if (!jobId || !headers || !sampleRows) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = ImportJobService.getJob(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const mappings = await generateMapping(headers, sampleRows);
    
    // Save generated mappings to job for reference
    ImportJobService.updateJob(jobId, { mappings });

    res.status(200).json({ mappings });
  } catch (error: any) {
    logger.error({ 
      err: error,
      url: req.originalUrl,
      body: req.body,
    }, 'Error in AI mapping controller');
    
    const errorMessage = error.message || String(error);
    
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      return res.status(429).json({ 
        success: false,
        error: 'Google Gemini AI rate limit exceeded. Please wait 30 seconds and try again.',
        details: errorMessage
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to generate AI mapping',
      details: errorMessage
    });
  }
};
