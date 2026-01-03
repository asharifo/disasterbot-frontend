import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "disasterbot_access_token";

const decodeToken = (token) => {
  if (!token) return null;
  if (typeof window === "undefined") return null;
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalizedPayload));
    return decoded;
  } catch (error) {
    console.error("Unable to decode access token", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
  });

  const setAccessToken = (token) => {
    const nextToken = token || null;
    setAccessTokenState(nextToken);

    if (typeof window === "undefined") return;

    if (nextToken) {
      window.localStorage.setItem(STORAGE_KEY, nextToken);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const user = useMemo(() => {
    const payload = decodeToken(accessToken);
    if (!payload?.username) return null;
    return {
      id: payload.id,
      username: payload.username,
    };
  }, [accessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      setAccessToken,
    }),
    [accessToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};