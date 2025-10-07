import { getToken } from '@/utils/tokenStorage';
import { getApiBase } from '@/lib/apiBase';

export async function getLessonWithTranscript(lessonId: string) {
  const base = getApiBase();
  const storedToken = typeof window !== 'undefined' ? (localStorage.getItem('token') || null) : null;
  const token = storedToken || getToken() || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${base}/api/lessons/${lessonId}`, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to fetch lesson transcript: ${res.status}`);
  }
  const json = await res.json().catch(() => ({}));
  // API shape: { success: true, data: { ...lesson fields... } }
  return json.data || json.lesson || json;
}

export async function getTranscriptStatus(lessonId: string) {
  const base = getApiBase();
  const storedToken = typeof window !== 'undefined' ? (localStorage.getItem('token') || null) : null;
  const token = storedToken || getToken() || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${base}/api/lessons/${lessonId}/transcript-status`, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to fetch transcript status: ${res.status}`);
  }
  const json = await res.json().catch(() => ({}));
  return json.data || json;
}

const transcriptService = {
  getLessonWithTranscript,
  getTranscriptStatus,
};

export default transcriptService;
