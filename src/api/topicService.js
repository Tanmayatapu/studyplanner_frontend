import api from "./axios";

export async function getTopicsBySubject(subjectId) {
  const { data } = await api.get(`/topics/subject/${subjectId}`);
  return data;
}

export async function createTopic(payload) {
  const { data } = await api.post("/topics", payload);
  return data;
}

export async function deleteTopic(topicId) {
  const { data } = await api.delete(`/topics/${topicId}`);
  return data;
}

export async function markTopicComplete(topicId) {
  const { data } = await api.patch(`/topics/${topicId}/complete`);
  return data;
}
