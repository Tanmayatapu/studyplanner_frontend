import api from "./axios";

export async function updatePreferences(payload) {
  const { data } = await api.put("/users/preferences", payload);
  return data;
}
