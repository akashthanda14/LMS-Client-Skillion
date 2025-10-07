import { useEffect, useRef, useState, useCallback } from 'react';
import { getTranscriptStatus } from '@/services/transcriptService';

type Status = 'queued' | 'processing' | 'completed' | 'failed' | 'unknown';

export function useTranscriptPolling(lessonId: string, initialTranscript?: string, opts?: { maxAttempts?: number }) {
  const maxAttempts = opts?.maxAttempts ?? 60;
  const [status, setStatus] = useState<Status>(initialTranscript ? 'completed' : 'unknown');
  const [transcript, setTranscript] = useState<string | undefined>(initialTranscript);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(initialTranscript ? 0 : 0);
  const [error, setError] = useState<unknown>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (controllerRef.current) controllerRef.current.abort();
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const shouldPoll = useCallback(() => {
    if (typeof document !== 'undefined' && document.hidden) return false;
    return true;
  }, []);

  const fetchOnce = useCallback(async () => {
    try {
      const data = await getTranscriptStatus(lessonId);
      if (!isMounted.current) return null;
      setStatus(data.status || 'unknown');
  setProgress(typeof data.progress === 'number' ? data.progress : undefined);
      if (data.transcript) setTranscript(data.transcript);
      return data;
    } catch (err: unknown) {
      if (!isMounted.current) return null;
      setError(err);
      return null;
    }
  }, [lessonId]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (controllerRef.current) controllerRef.current.abort();
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startPolling = useCallback(async () => {
    if (initialTranscript) return;
    if (!shouldPoll()) return;
    setIsPolling(true);
    setAttempts(0);
    setError(null);

    const decideInterval = (attempt: number) => {
      if (attempt < 10) return 3000;
      if (attempt < 30) return 5000;
      return 10000;
    };

    let attempt = 0;
    while (isMounted.current && attempt < maxAttempts) {
      if (!shouldPoll()) {
        await new Promise((res) => setTimeout(res, 1000));
        continue;
      }

      controllerRef.current = new AbortController();
      try {
        const data = await fetchOnce();
        attempt += 1;
        setAttempts(attempt);

        if (data && (data.status === 'completed' || data.status === 'failed')) {
          setStatus(data.status);
          if (data.transcript) setTranscript(data.transcript);
          stopPolling();
          return;
        }
      } catch (e: unknown) {
        setError(e);
      }

      const base = decideInterval(attempt);
      const jitter = Math.floor((Math.random() - 0.5) * 600); // ±300ms
      const wait = Math.max(0, base + jitter);

      await new Promise<void>((resolve) => {
        timeoutRef.current = window.setTimeout(() => resolve(), wait);
      });
    }

    setIsPolling(false);
    if (attempt >= maxAttempts) setStatus('failed');
  }, [fetchOnce, initialTranscript, maxAttempts, shouldPoll, stopPolling]);

  useEffect(() => {
    if (initialTranscript) {
      setTranscript(initialTranscript);
      setStatus('completed');
    }
    else {
      // auto-start polling when no initial transcript
      startPolling().catch(() => undefined);
    }

    return () => {
      stopPolling();
    };
  }, [initialTranscript, startPolling, stopPolling]);

  return { status, transcript, progress, isPolling, attempts, error, startPolling, stopPolling } as const;
}

export default useTranscriptPolling;

