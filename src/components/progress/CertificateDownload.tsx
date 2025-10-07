'use client';

import { useState } from 'react';
import { Download, FileText, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { progressAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface CertificateDownloadProps {
  enrollmentId: string;
  courseTitle: string;
}

export function CertificateDownload({ enrollmentId, courseTitle }: CertificateDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [jsonPreview, setJsonPreview] = useState<unknown>(null);
  const [info, setInfo] = useState<string>('');

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError('');

      // Request generation on server if supported (idempotent)
      try {
        const genResp = await progressAPI.generateCertificate(enrollmentId);
        if (genResp?.success) {
          setInfo(genResp.message || 'Generation queued');
        }
      } catch (_genErr: unknown) {
        // ignore - backend may not support generate endpoint; continue to poll
      }

      // Wait for certificate metadata to be available (worker may be asynchronous)
      try {
        await progressAPI.waitForCertificate(enrollmentId, { intervalMs: 2500, timeoutMs: 60000 });
      } catch (_pollErr: unknown) {
        // If still not available, show friendly message and let user preview later
        setError('Certificate is still being generated. Please try again in a few moments.');
        return;
      }

      const result = await progressAPI.downloadCertificate(enrollmentId);

      if (result.type === 'pdf') {
        const url = result.url;
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `${courseTitle.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      } else {
        // Backend returned JSON (dev placeholder). Show message and preview JSON
        setPdfUrl('');
        setShowPreview(true);
        setError('PDF generation not implemented on server; previewing certificate data below.');
        setJsonPreview(result.data);
      }
    } catch (err: unknown) {
      console.error('Download failed:', err);
      const message = typeof err === 'object' && err !== null && 'response' in err
        ? ((err as any).response?.data?.message as string | undefined)
        : undefined;
      setError(message || 'Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setIsDownloading(true);
      setError('');

      // Request generation on server if supported (idempotent)
      try {
        const genResp = await progressAPI.generateCertificate(enrollmentId);
        if (genResp?.success) {
          setInfo(genResp.message || 'Generation queued');
        }
      } catch (_genErr: unknown) {
        // ignore - backend may not support generate endpoint; continue to poll
      }

      // Ensure certificate exists before attempting preview (avoid 404s while worker runs)
      try {
        await progressAPI.waitForCertificate(enrollmentId, { intervalMs: 2500, timeoutMs: 60000 });
      } catch (_pollErr: unknown) {
        setError('Certificate is still being generated. Please try preview after a short while.');
        return;
      }

      const result = await progressAPI.downloadCertificate(enrollmentId);
      if (result.type === 'pdf') {
        setPdfUrl(result.url);
        setShowPreview(true);
      } else {
        setJsonPreview(result.data);
        setShowPreview(true);
      }
    } catch (err: unknown) {
      console.error('Preview failed:', err);
      const message = typeof err === 'object' && err !== null && 'response' in err
        ? ((err as any).response?.data?.message as string | undefined)
        : undefined;
      setError(message || 'Failed to load certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Certificate
            </>
          )}
        </Button>

        <Button
          onClick={handlePreview}
          disabled={isDownloading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Preview
        </Button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 mt-2"
        >
          {error}
        </motion.p>
      )}
      {info && !error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-blue-600 mt-2"
        >
          {info}
        </motion.p>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (pdfUrl || jsonPreview != null) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closePreview}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Certificate Preview
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(pdfUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button size="sm" variant="ghost" onClick={closePreview}>
                    ✕
                  </Button>
                </div>
              </div>

              {/* Viewer */}
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Certificate Preview"
                />
              ) : jsonPreview != null ? (
                <div className="p-6 overflow-auto h-full">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(jsonPreview as any, null, 2)}</pre>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
