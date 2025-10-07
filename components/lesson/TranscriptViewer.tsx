 'use client';

import { useState, useEffect, useRef } from 'react';
import useTranscript from '@/hooks/useTranscript';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Props {
  lessonId: string;
  initialTranscript?: string;
  lessonTitle?: string;
  currentTime?: number | undefined;
  onSeek?: (time: number) => void;
}

export function TranscriptViewer({ lessonId, initialTranscript, lessonTitle, currentTime, onSeek }: Props) {
  const { loading, transcript, segments, error } = useTranscript(lessonId);
  const [collapsed, setCollapsed] = useState(false);
  const { addToast } = useToast();
  const regionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // noop: single-fetch hook handles data fetching
  }, [lessonId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript || '');
      addToast('Transcript copied to clipboard', 'success');
    } catch (e) {
      addToast('Failed to copy transcript', 'error');
    }
  };

  const handleDownload = () => {
    const text = transcript || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(lessonTitle || lessonId).replace(/[^a-z0-9-_]/gi, '-')}-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div role="region" aria-label="Video transcript" aria-live="polite" ref={regionRef} className="p-4 bg-white border border-gray-100 rounded-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle transcript">
            {collapsed ? 'Expand' : 'Collapse'}
          </Button>
          <Button size="sm" onClick={handleCopy} aria-label="Copy transcript">Copy</Button>
          <Button size="sm" onClick={handleDownload} aria-label="Download transcript">Download</Button>
        </div>
      </div>

      {!transcript && loading && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading transcript…</span>
        </div>
      )}

  {!transcript && Boolean(error) && (
        <div className="text-sm text-gray-700">
          The transcript is not available. Please <a className="text-blue-600 underline" href="/contact">contact support</a> or try again later.
        </div>
      )}

      {transcript && (
        <div className={`mt-3 ${collapsed ? 'hidden' : 'block'}`}>
          <div className="whitespace-pre-wrap overflow-auto max-h-72 text-sm text-gray-800">
            <pre className="whitespace-pre-wrap">{transcript}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default TranscriptViewer;
