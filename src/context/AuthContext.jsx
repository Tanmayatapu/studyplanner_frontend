import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { loginUser as loginRequest, registerUser as registerRequest } from "../api/authService.jsx";
import { updatePreferences as updatePreferencesRequest } from "../api/userService.js";

const AppContext = createContext(null);
const SESSION_KEY = "ai-study-planner-session";

const defaultPreferences = {
  dailyStudyHours: 3,
  breakTime: 10,
  preferredStudyTime: "evening",
};

const topicAccentMap = {
  hard: "bg-rose-500/10 border-rose-500/30 text-rose-200",
  medium: "bg-amber-500/10 border-amber-500/30 text-amber-200",
  easy: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
  revision: "bg-sky-500/10 border-sky-500/30 text-sky-200",
};

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => readSession());
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    writeSession(session);
  }, [session]);

  const currentUser = useMemo(() => {
    if (!session?.token || !session?._id || !session?.name || !session?.email) return null;

    return {
      _id: session._id,
      name: session.name,
      email: session.email,
      token: session.token,
      studyPreferences: session.studyPreferences || defaultPreferences,
    };
  }, [session]);

  async function registerUser(payload) {
    return await registerRequest(payload);
  }

  async function loginUser(payload) {
    setAuthLoading(true);

    try {
      const data = await loginRequest(payload);
      const nextSession = {
        _id: data._id,
        name: data.name,
        email: data.email,
        token: data.token,
        studyPreferences: session?.studyPreferences || defaultPreferences,
      };

      setSession(nextSession);
      return nextSession;
    } finally {
      setAuthLoading(false);
    }
  }

  function logoutUser() {
    setSession(null);
  }

  async function updatePreferences(payload) {
    const normalizedPayload = {
      ...payload,
      preferredStudyTime: payload.preferredStudyTime?.toLowerCase(),
    };

    const data = await updatePreferencesRequest(normalizedPayload);

    setSession((current) => current ? {
      ...current,
      studyPreferences: data.studyPreferences,
    } : current);

    return data;
  }

  const value = {
    authLoading,
    currentUser,
    topicAccentMap,
    registerUser,
    loginUser,
    logoutUser,
    updatePreferences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}

function readSession() {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(SESSION_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed?.token && parsed?._id && parsed?.name && parsed?.email) {
      return parsed;
    }

    window.localStorage.removeItem(SESSION_KEY);
    return null;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function writeSession(session) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
