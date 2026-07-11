export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const uploadCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};

export const getAiMapping = async (jobId: string, headers: string[], sampleRows: any[]) => {
  const res = await fetch(`${API_BASE_URL}/mapping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, headers, sampleRows }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'AI Mapping failed');
  }
  return res.json();
};

export const startProcessing = async (jobId: string, mappings: any[]) => {
  const res = await fetch(`${API_BASE_URL}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, mappings }),
  });
  
  if (!res.ok) throw new Error('Failed to start processing');
  return res.json();
};

export const getJobProgress = async (jobId: string) => {
  const res = await fetch(`${API_BASE_URL}/process/${jobId}/status`);
  if (!res.ok) throw new Error('Failed to get job status');
  return res.json();
};

export const getJobResult = async (jobId: string) => {
  const res = await fetch(`${API_BASE_URL}/process/${jobId}/result`);
  if (!res.ok) throw new Error('Failed to get job result');
  return res.json();
};
