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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError('');

      const url = await progressAPI.downloadCertificate(enrollmentId);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${courseTitle.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err: any) {
      console.error('Download failed:', err);
      setError(err.response?.data?.message || 'Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setIsDownloading(true);
      setError('');

      const url = await progressAPI.downloadCertificate(enrollmentId);
      setPdfUrl(url);
      setShowPreview(true);
    } catch (err: any) {
      console.error('Preview failed:', err);
      setError(err.response?.data?.message || 'Failed to load certificate');
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

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && pdfUrl && (
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

              {/* PDF Viewer */}
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="Certificate Preview"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
