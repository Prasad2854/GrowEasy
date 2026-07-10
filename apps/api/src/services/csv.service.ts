import fs from 'fs';
import Papa from 'papaparse';
import { logger } from '../utils/logger';

export const parseCsvHeaders = (filePath: string): Promise<{ headers: string[], sampleRows: any[] }> => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const sampleRows: any[] = [];
    let headers: string[] = [];
    let rowCount = 0;

    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      step: (results, parser) => {
        if (rowCount === 0) {
          headers = results.meta.fields || [];
        }
        
        if (rowCount < 5) {
          sampleRows.push(results.data);
        } else {
          parser.abort();
        }
        rowCount++;
      },
      complete: () => {
        resolve({ headers, sampleRows });
      },
      error: (error: any) => {
        logger.error({ err: error }, 'PapaParse error');
        reject(error);
      }
    });
  });
};

export const parseFullCsv = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const rows: any[] = [];

    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      step: (results) => {
        rows.push(results.data);
      },
      complete: () => {
        resolve(rows);
      },
      error: (error: any) => {
        logger.error({ err: error }, 'PapaParse full file error');
        reject(error);
      }
    });
  });
};
