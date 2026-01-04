import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "disasterbot_access_token";
const DEFAULT_API_BASE_URL = "http://localhost:3000";

/* ------------------ helpers ------------------ */

const decodeToken = (token) => {
  if (!token || typeof window === "undefined") return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalizedPayload));
  } catch {
    return null;
  }
};

const isTokenExpired = (payload) => {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
};

const resolveApiBaseUrl = (explicit) => {
  return (explicit || DEFAULT_API_BASE_URL).replace(/\/$/, "");
};

/* ------------------ provider ------------------ */

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
  });

  const [isAuthReady, setIsAuthReady] = useState(false);

  const apiBaseUrl = useMemo(() => {
    return resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
  }, []);

  const setAccessToken = useCallback((token) => {
    const next = token || null;
    setAccessTokenState(next);

    if (typeof window === "undefined") return;

    if (next) {
      window.localStorage.setItem(STORAGE_KEY, next);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const resp = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!resp.ok) return null;

      const data = await resp.json();
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken;
      }
    } catch (err) {
      console.error("Refresh failed", err);
    }

    return null;
  }, [apiBaseUrl, setAccessToken]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setAccessToken(null);
    }
  }, [apiBaseUrl, setAccessToken]);

  const user = useMemo(() => {
    const payload = decodeToken(accessToken);
    if (!payload?.username) return null;
    return { id: payload.id, username: payload.username };
  }, [accessToken]);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const payload = decodeToken(accessToken);

      if (accessToken && payload && !isTokenExpired(payload)) {
        if (mounted) setIsAuthReady(true);
        return;
      }

      const refreshed = await refreshAccessToken();
      if (!refreshed && mounted) setAccessToken(null);

      if (mounted) setIsAuthReady(true);
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [accessToken, refreshAccessToken, setAccessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      isAuthReady,
      logout,
      refreshAccessToken,
      user,
      setAccessToken,
    }),
    [accessToken, isAuthReady, logout, refreshAccessToken, user, setAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ------------------ hook ------------------ */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
