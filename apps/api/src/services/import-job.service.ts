import { ImportJob, JobStatus } from '@groweasy/shared-types';
import { logger } from '../utils/logger';

class ImportJobServiceImpl {
  private jobs: Map<string, ImportJob> = new Map();

  createJob(id: string, filename: string, filePath: string, totalRows: number): ImportJob {
    const job: ImportJob = {
      id,
      filename,
      filePath,
      totalRows,
      processedRows: 0,
      importedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      status: 'pending',
      records: [],
    };
    this.jobs.set(id, job);
    return job;
  }

  getJob(id: string): ImportJob | undefined {
    return this.jobs.get(id);
  }

  updateJob(id: string, updates: Partial<ImportJob>): ImportJob | undefined {
    const job = this.jobs.get(id);
    if (job) {
      const updated = { ...job, ...updates };
      this.jobs.set(id, updated);
      return updated;
    }
    return undefined;
  }

  updateStatus(id: string, status: JobStatus, error?: string) {
    this.updateJob(id, { status, error });
    logger.info(`Job ${id} status updated to ${status}`);
  }

  addRecords(id: string, newRecords: any[]) {
    const job = this.jobs.get(id);
    if (job) {
      job.records = [...(job.records || []), ...newRecords];
      this.jobs.set(id, job);
    }
  }

  incrementCounts(id: string, imported: number, skipped: number, failed: number) {
    const job = this.jobs.get(id);
    if (job) {
      job.importedCount += imported;
      job.skippedCount += skipped;
      job.failedCount += failed;
      job.processedRows += (imported + skipped + failed);
      this.jobs.set(id, job);
    }
  }
}

export const ImportJobService = new ImportJobServiceImpl();
