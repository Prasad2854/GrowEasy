'use client';

import { useState } from 'react';
import { FileUploader } from './FileUploader';
import { DataPreviewTable } from './DataPreviewTable';
import { FieldMappingInterface } from './FieldMappingInterface';
import { ImportProgress } from './ImportProgress';
import { uploadCsv, getAiMapping, startProcessing } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Wand2 } from 'lucide-react';

type Step = 'upload' | 'preview_map' | 'progress';

export function ImporterWizard() {
  const [step, setStep] = useState<Step>('upload');
  const [jobId, setJobId] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isAiMapping, setIsAiMapping] = useState(false);
  const [isStartingProcess, setIsStartingProcess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      const data = await uploadCsv(file);
      setJobId(data.jobId);
      setHeaders(data.headers);
      setSampleRows(data.sampleRows);
      
      // Init mappings to null
      setMappings(data.headers.map((h: string) => ({ csvColumn: h, crmField: null })));
      setStep('preview_map');
    } catch (err: any) {
      setError(err.message || 'Failed to upload CSV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAutoMap = async () => {
    if (!jobId) return;
    try {
      setIsAiMapping(true);
      setError(null);
      const data = await getAiMapping(jobId, headers, sampleRows);
      
      // Merge AI mappings with existing ones (in case some were manually set or preserving structure)
      if (data.mappings) {
        setMappings(data.mappings);
      }
    } catch (err: any) {
      setError(err.message || 'AI mapping failed');
    } finally {
      setIsAiMapping(false);
    }
  };

  const handleMappingChange = (csvColumn: string, crmField: string | null) => {
    setMappings((prev) => 
      prev.map((m) => m.csvColumn === csvColumn ? { ...m, crmField } : m)
    );
  };

  const handleStartImport = async () => {
    if (!jobId) return;
    try {
      setIsStartingProcess(true);
      setError(null);
      await startProcessing(jobId, mappings);
      setStep('progress');
    } catch (err: any) {
      setError(err.message || 'Failed to start import');
    } finally {
      setIsStartingProcess(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg font-medium border border-destructive/20">
          {error}
        </div>
      )}

      {step === 'upload' && (
        <div className="space-y-4">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Upload Data</h2>
            <p className="text-muted-foreground">Select a CSV file to import leads into your CRM.</p>
          </div>
          <FileUploader onFileSelect={handleFileUpload} isLoading={isUploading} />
          {isUploading && (
            <div className="flex justify-center items-center text-muted-foreground pt-4">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Uploading and analyzing...</span>
            </div>
          )}
        </div>
      )}

      {step === 'preview_map' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Data Mapping</h2>
              <p className="text-muted-foreground">Map your CSV columns to CRM fields.</p>
            </div>
            <Button onClick={handleAutoMap} disabled={isAiMapping} variant="secondary" className="gap-2">
              {isAiMapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isAiMapping ? 'AI Analyzing...' : 'Auto-Map with AI'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Column Mapping</h3>
              <FieldMappingInterface mappings={mappings} onMappingChange={handleMappingChange} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Preview</h3>
              <DataPreviewTable headers={headers} sampleRows={sampleRows} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleStartImport} disabled={isStartingProcess} size="lg" className="gap-2">
              {isStartingProcess ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Import'}
              {!isStartingProcess && <ArrowRight className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      )}

      {step === 'progress' && jobId && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ImportProgress jobId={jobId} />
          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Import Another File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
