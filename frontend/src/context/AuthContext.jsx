import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();
const STORAGE_KEY = "librus-session";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const saved = typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { sessionId: null, user: null };
  });

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [session]);

  const value = useMemo(
    () => ({
      sessionId: session.sessionId,
      user: session.user,
      login: (payload) => setSession({ sessionId: payload.sessionId, user: payload.user }),
      logout: () => setSession({ sessionId: null, user: null }),
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
