import apiClient from '@/services/authService';

export async function getLessonWithTranscript(lessonId: string) {
  const res = await apiClient.get(`/api/lessons/${lessonId}`);
  return res.data.lesson;
}

export async function getTranscriptStatus(lessonId: string) {
  const res = await apiClient.get(`/api/lessons/${lessonId}/transcript-status`);
  return res.data.data;
}

const transcriptService = {
  getLessonWithTranscript,
  getTranscriptStatus,
};

export default transcriptService;
