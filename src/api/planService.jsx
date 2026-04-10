import api from "./axios";

export async function getStudyPlan(subjectId) {
  const { data } = await api.get(`/study-plan/${subjectId}`);
  return data;
}

export async function getTodayPlan(subjectId) {
  const { data } = await api.get(`/study-plan/today/${subjectId}`);
  return data;
}

export async function getSubjectProgress(subjectId) {
  const { data } = await api.get(`/study-plan/progress/${subjectId}`);
  return data;
}
