'use client';
import { useState } from 'react';

export interface UploadResult { url: string; fileName: string; }

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, folder = 'uploads'): Promise<UploadResult | null> => {
    setUploading(true); setError(null); setProgress(20);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      setProgress(50);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      setProgress(90);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setProgress(100);
      return { url: data.url, fileName: data.fileName };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      return null;
    } finally { setUploading(false); }
  };

  const uploadMultiple = async (files: File[], folder = 'uploads'): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    for (const file of files) {
      const r = await uploadFile(file, folder);
      if (r) results.push(r);
    }
    return results;
  };

  const deleteFile = async (fileName: string): Promise<void> => {
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName }),
    });
  };

  return { uploading, progress, error, uploadFile, uploadMultiple, deleteFile };
}
