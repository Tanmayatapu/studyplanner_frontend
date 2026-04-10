import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const rawSession = window.localStorage.getItem("ai-study-planner-session");

  if (rawSession) {
    try {
      const session = JSON.parse(rawSession);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch {
      window.localStorage.removeItem("ai-study-planner-session");
    }
  }

  return config;
});

export default api;
