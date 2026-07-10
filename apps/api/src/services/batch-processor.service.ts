import { ColumnMapping } from '@groweasy/shared-types';
import { processBatch } from './ai.service';
import { ImportJobService } from './import-job.service';
import { logger } from '../utils/logger';

// Custom concurrency limiter to avoid ESM issues with external packages like p-limit
const asyncPool = async (concurrency: number, items: any[], iteratorFn: (item: any, index: number) => Promise<any>) => {
  const ret = [];
  const executing = new Set<Promise<any>>();
  
  for (let i = 0; i < items.length; i++) {
    const p = Promise.resolve().then(() => iteratorFn(items[i], i));
    ret.push(p);
    executing.add(p);
    
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(ret);
};

export const processJobInBatches = async (jobId: string, rows: any[], mappings: ColumnMapping[]) => {
  const BATCH_SIZE = 20;
  const CONCURRENCY_LIMIT = 3;

  // Chunk the rows into batches
  const chunks: any[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    chunks.push(rows.slice(i, i + BATCH_SIZE));
  }

  logger.info(`Starting job ${jobId} with ${chunks.length} batches (total rows: ${rows.length})`);
  
  try {
    await asyncPool(CONCURRENCY_LIMIT, chunks, async (chunk, index) => {
      try {
        logger.info(`Processing batch ${index + 1}/${chunks.length} for job ${jobId}`);
        const result = await processBatch(chunk, mappings);
        
        ImportJobService.incrementCounts(jobId, result.imported, result.skipped, 0);
        ImportJobService.addRecords(jobId, result.records);
        
      } catch (error) {
        logger.error({ err: error }, `Batch ${index + 1}/${chunks.length} failed for job ${jobId}`);
        ImportJobService.incrementCounts(jobId, 0, 0, chunk.length); // Treat the whole batch as failed
      }
    });

    ImportJobService.updateStatus(jobId, 'completed');
    logger.info(`Job ${jobId} completed successfully`);
  } catch (error) {
    ImportJobService.updateStatus(jobId, 'failed', 'A critical error occurred during batch processing');
    logger.error({ err: error }, `Job ${jobId} failed completely`);
  }
};
