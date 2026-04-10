import api from "./axios";

export async function logStudy(payload) {
  const { data } = await api.post("/study-log", payload);
  return data;
}
