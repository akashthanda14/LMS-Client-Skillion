'use client';

import { useState, useEffect, useRef } from 'react';
import { transcriptAPI, TranscriptStatus } from '@/lib/api';

interface UseTranscriptPollingOptions {
  lessonId: string;
  enabled?: boolean; // Start polling immediately
  pollInterval?: number; // Milliseconds between polls
  maxAttempts?: number; // Max polling attempts before giving up
}

export const useTranscriptPolling = ({
  lessonId,
  enabled = true,
  pollInterval = 5000, // Poll every 5 seconds
  maxAttempts = 60, // Stop after 5 minutes (60 * 5s)
}: UseTranscriptPollingOptions) => {
  const [status, setStatus] = useState<TranscriptStatus | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const attemptsRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const checkStatus = async () => {
    try {
      const response = await transcriptAPI.getTranscriptStatus(lessonId);
      const data = response.data;
      
      setStatus(data);
      setError(null);

      // Stop polling if completed or failed
      if (data.status === 'completed' || data.status === 'failed') {
        stopPolling();
      }

      attemptsRef.current += 1;

      // Stop if max attempts reached
      if (attemptsRef.current >= maxAttempts) {
        stopPolling();
        setError('Transcription is taking longer than expected');
      }
    } catch (err: any) {
      // Don't stop polling on network errors, just log and continue
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ERR_NETWORK') {
        console.log('Network timeout, will retry...');
        return; // Continue polling
      }
      
      setError(err.response?.data?.message || 'Failed to check transcript status');
      stopPolling();
    }
  };

  useEffect(() => {
    if (!isPolling || !lessonId) return;

    // Check immediately
    checkStatus();

    // Then poll at interval
    intervalRef.current = setInterval(checkStatus, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lessonId, isPolling, pollInterval]);

  return {
    status,
    isPolling,
    error,
    stopPolling,
    startPolling: () => {
      attemptsRef.current = 0;
      setIsPolling(true);
    },
  };
};
