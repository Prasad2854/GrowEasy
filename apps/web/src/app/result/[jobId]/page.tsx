'use client';

import { useQuery } from '@tanstack/react-query';
import { getJobResult } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ArrowLeft } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import Papa from 'papaparse';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const [globalFilter, setGlobalFilter] = useState('');

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['jobResult', jobId],
    queryFn: () => getJobResult(jobId),
  });

  const columnHelper = createColumnHelper<any>();
  const columns = useMemo(() => {
    if (!result?.records || result.records.length === 0) return [];
    
    // Extract headers dynamically from the first record keys
    const headers = Object.keys(result.records[0]);
    
    return headers.map(header => 
      columnHelper.accessor(header, {
        header: () => <span className="capitalize font-semibold">{header.replace(/_/g, ' ')}</span>,
        cell: info => <div className="max-w-[200px] truncate" title={String(info.getValue() || '')}>{info.getValue() || '-'}</div>
      })
    );
  }, [result, columnHelper]);

  const table = useReactTable({
    data: result?.records || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const downloadJson = () => {
    if (!result?.records) return;
    const blob = new Blob([JSON.stringify(result.records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-result-${jobId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    if (!result?.records) return;
    const csv = Papa.unparse(result.records);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-result-${jobId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-6">
        <Card className="p-8 border-destructive/50 bg-destructive/10 text-destructive">
          <h2 className="text-xl font-semibold mb-2">Error loading results</h2>
          <p>Could not fetch the import result. The job might be invalid or expired.</p>
        </Card>
        <Button onClick={() => router.push('/')} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Summary</h1>
          <p className="text-muted-foreground mt-1">Review your processed leads</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={downloadJson} variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> JSON
          </Button>
          <Button onClick={downloadCsv} className="gap-2">
            <Download className="w-4 h-4" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Successfully Imported</p>
          <p className="text-4xl font-bold mt-2 text-green-600 dark:text-green-400">{result.imported}</p>
        </Card>
        <Card className="p-6 flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Skipped (No Email/Mobile)</p>
          <p className="text-4xl font-bold mt-2 text-yellow-600 dark:text-yellow-400">{result.skipped}</p>
        </Card>
        <Card className="p-6 flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Failed Batches</p>
          <p className="text-4xl font-bold mt-2 text-destructive">{result.failed}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Extracted Records</h3>
          <Input 
            placeholder="Search all columns..." 
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-muted"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length || 1} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {result.records.length} results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-center pt-8">
        <Button onClick={() => router.push('/')} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="w-5 h-5" /> Import Another File
        </Button>
      </div>
    </div>
  );
}
