import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { ImportJobService } from '../../services/import-job.service';
import { parseFullCsv } from '../../services/csv.service';
import { processJobInBatches } from '../../services/batch-processor.service';

export const handleProcess = async (req: Request, res: Response) => {
  try {
    const { jobId, mappings } = req.body;

    if (!jobId || !mappings) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = ImportJobService.getJob(jobId);
    if (!job || !job.filePath) {
      return res.status(404).json({ error: 'Job not found or invalid file' });
    }

    ImportJobService.updateStatus(jobId, 'processing');
    
    // Parse full CSV
    const rows = await parseFullCsv(job.filePath);
    ImportJobService.updateJob(jobId, { totalRows: rows.length, mappings });
    
    // Fire and forget batch processing
    processJobInBatches(jobId, rows, mappings).catch(err => {
      logger.error({ err }, `Uncaught error processing job ${jobId}`);
    });

    res.status(200).json({ message: 'Processing started', jobId });
  } catch (error) {
    logger.error({ err: error }, 'Error starting processing');
    res.status(500).json({ error: 'Failed to start processing' });
  }
};

export const getJobStatus = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = ImportJobService.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.status(200).json(job);
  } catch (error) {
    logger.error({ err: error }, 'Error getting job status');
    res.status(500).json({ error: 'Failed to get job status' });
  }
};

export const getJobResult = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = ImportJobService.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.status !== 'completed' && job.status !== 'failed') {
      return res.status(400).json({ error: 'Job is not finished yet' });
    }
    
    res.status(200).json({
      success: job.status === 'completed',
      imported: job.importedCount,
      skipped: job.skippedCount,
      failed: job.failedCount,
      records: job.records || [],
    });
  } catch (error) {
    logger.error({ err: error }, 'Error getting job result');
    res.status(500).json({ error: 'Failed to get job result' });
  }
};
