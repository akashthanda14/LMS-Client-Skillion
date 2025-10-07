import { useEffect, useState } from 'react';
import { getLessonWithTranscript } from '@/services/transcriptService';

export default function useTranscript(lessonId: string) {
  const [loading, setLoading] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string | undefined>(undefined);
  const [segments, setSegments] = useState<Array<{ id: string; startTime: number; endTime: number; text: string }>>([]);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getLessonWithTranscript(lessonId)
      .then((lesson: any) => {
        if (!mounted) return;
        if (lesson?.transcript) setTranscript(lesson.transcript);
        const s = lesson?.transcript?.segments ?? lesson?.segments ?? [];
        if (Array.isArray(s)) {
          setSegments(s.map((seg: any) => ({ id: seg.id, startTime: seg.startTime, endTime: seg.endTime, text: seg.text })));
        }
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [lessonId]);

  return { loading, transcript, segments, error } as const;
}
