import api from "./axios";

export async function getStudyPlan(subjectId) {
  const path = subjectId ? `/study-plan/${subjectId}` : "/study-plan";
  const { data } = await api.get(path);
  return data;
}

export async function getTodayPlan(subjectId) {
  const path = subjectId ? `/study-plan/today/${subjectId}` : "/study-plan/today";
  const { data } = await api.get(path);
  return data;
}

export async function getSubjectProgress(subjectId) {
  const { data } = await api.get(`/study-plan/progress/${subjectId}`);
  return data;
}
