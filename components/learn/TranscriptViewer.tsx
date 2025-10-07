'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Copy, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranscriptPolling } from '@/hooks/useTranscriptPolling';

interface TranscriptViewerProps {
  lessonId: string;
  initialTranscript?: string | null;
  lessonTitle?: string;
}

export function TranscriptViewer({ 
  lessonId, 
  initialTranscript,
  lessonTitle = 'Lesson'
}: TranscriptViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use the polling hook (lessonId, initialTranscript)
  const { status, transcript: polledTranscript, progress, isPolling, error } = useTranscriptPolling(lessonId, initialTranscript ?? undefined);

  const transcript = initialTranscript || polledTranscript;
  const transcriptStatus = status; // 'queued' | 'processing' | 'completed' | 'failed' | 'unknown'

  const handleCopy = async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle.replace(/[^a-z0-9]/gi, '_')}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Highlight search matches
  const getHighlightedText = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // Show loading state while polling
  if (isPolling && !transcript) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Video Transcript
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription className="ml-2">
              {transcriptStatus === 'queued' && 'Transcription queued...'}
              {transcriptStatus === 'processing' && `Generating transcript... ${progress || 0}%`}
              {!transcriptStatus && 'Checking transcript status...'}
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error || transcriptStatus === 'failed') {
    const errorMessage = typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : 'Failed to generate transcript';
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Video Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
      <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="ml-2 text-red-800">
        {errorMessage}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show message if no transcript and not processing
  if (!transcript && (transcriptStatus === 'unknown')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Video Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription className="ml-2">
              Transcript not available yet. It will be generated automatically.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show transcript
  if (transcript) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Video Transcript
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                AI Generated
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copied}
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Download as text file"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Transcript Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-h-96 overflow-y-auto p-4 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {getHighlightedText(transcript)}
              </div>
            </motion.div>

            <p className="text-xs text-gray-500 mt-2">
              This transcript was automatically generated using AI and may contain errors.
            </p>
          </CardContent>
        )}
      </Card>
    );
  }

  return null;
}
