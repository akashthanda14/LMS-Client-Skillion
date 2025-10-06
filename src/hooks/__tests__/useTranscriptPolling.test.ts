import { renderHook, act } from '@testing-library/react';
import useTranscriptPolling from '../useTranscriptPolling';
import * as service from '@/services/transcriptService';

jest.useFakeTimers();

describe('useTranscriptPolling', () => {
  afterEach(() => {
    jest.clearAllTimers();
    jest.resetAllMocks();
  });

  it('returns completed immediately when initialTranscript provided', () => {
    const { result } = renderHook(() => useTranscriptPolling('lesson1', 'hello'));
    expect(result.current.status).toBe('completed');
    expect(result.current.transcript).toBe('hello');
    expect(result.current.isPolling).toBe(false);
  });

  it('polls until completed', async () => {
    const mockStatus = jest.spyOn(service, 'getTranscriptStatus') as any;
    mockStatus
      .mockResolvedValueOnce({ status: 'queued' })
      .mockResolvedValueOnce({ status: 'processing' })
      .mockResolvedValueOnce({ status: 'completed', transcript: 'done' });

    const { result } = renderHook(() => useTranscriptPolling('lesson2'));

    act(() => {
      result.current.startPolling();
    });

    // fast-forward a few intervals
    await act(async () => {
      jest.advanceTimersByTime(3100);
    });

    await act(async () => {
      jest.advanceTimersByTime(3100);
    });

    await act(async () => {
      jest.advanceTimersByTime(3100);
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.transcript).toBe('done');
  });
});
