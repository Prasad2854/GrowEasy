'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getJobProgress } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ImportProgressProps {
  jobId: string;
}

export function ImportProgress({ jobId }: ImportProgressProps) {
  const router = useRouter();

  const { data: job, isError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobProgress(jobId),
    refetchInterval: (query) => {
      // @ts-ignore
      const data = query?.state?.data;
      if (data?.status === 'completed' || data?.status === 'failed') return false;
      return 1000; // Poll every second
    },
  });

  const isCompleted = job?.status === 'completed';
  const isFailed = job?.status === 'failed';

  useEffect(() => {
    if (isCompleted || isFailed) {
      // Small delay so user sees 100% before redirect
      const t = setTimeout(() => {
        router.push(`/result/${jobId}`);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [isCompleted, isFailed, router, jobId]);

  if (isError) {
    return (
      <Card className="p-6 border-destructive/50 bg-destructive/10">
        <div className="flex items-center text-destructive">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>Failed to load job progress.</p>
        </div>
      </Card>
    );
  }

  if (!job) return null;

  const percentage = job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0;

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              Importing Data
              {job.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">Processing rows into CRM</p>
          </div>
          <Badge 
            variant={isCompleted ? "default" : isFailed ? "destructive" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {job.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>{job.processedRows} of {job.totalRows} rows</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        {isCompleted && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <p className="font-medium">Import completed successfully!</p>
          </div>
        )}

        {isFailed && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex flex-col gap-2">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p className="font-medium">Import failed</p>
            </div>
            {job.error && <p className="text-sm opacity-90 ml-7">{job.error}</p>}
          </div>
        )}
      </div>
    </Card>
  );
}
