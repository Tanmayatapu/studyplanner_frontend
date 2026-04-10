import api from "./axios";

export async function getTotalStudyHours() {
  const { data } = await api.get("/analytics/total-hours");
  return data;
}

export async function getWeeklyPerformance() {
  const { data } = await api.get("/analytics/weekly");
  return data;
}

export async function getStudyStreak() {
  const { data } = await api.get("/analytics/streak");
  return data;
}

export async function getWeakTopics() {
  const { data } = await api.get("/analytics/weak-topics");
  return data;
}
