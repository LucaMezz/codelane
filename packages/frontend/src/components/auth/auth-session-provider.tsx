import { fetchAuthSession, type AuthSession } from "@appkit/api-client";
import { toast } from "@appkit/ui";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useFrontendRuntimeConfig } from "../../config";

type AuthSessionStatus = "loading" | "authenticated" | "unauthenticated";

type AuthSessionContextValue = {
  session: AuthSession;
  status: AuthSessionStatus;
  user: NonNullable<AuthSession>["user"] | null;
  clearSession: () => void;
  refreshSession: () => Promise<AuthSession>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

const sessionCache = new Map<string, AuthSession>();
const sessionRequests = new Map<string, Promise<AuthSession>>();

function readCachedSession(apiBaseUrl: string): AuthSession | undefined {
  return sessionCache.get(apiBaseUrl);
}

function fetchCachedSession(
  apiBaseUrl: string,
  { force = false }: { force?: boolean } = {},
): Promise<AuthSession> {
  const existingRequest = sessionRequests.get(apiBaseUrl);

  if (existingRequest && !force) {
    return existingRequest;
  }

  const request = fetchAuthSession({ apiBaseUrl })
    .then((session) => {
      sessionCache.set(apiBaseUrl, session);
      return session;
    })
    .finally(() => {
      if (sessionRequests.get(apiBaseUrl) === request) {
        sessionRequests.delete(apiBaseUrl);
      }
    });

  sessionRequests.set(apiBaseUrl, request);
  return request;
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const { apiBaseUrl } = useFrontendRuntimeConfig();
  const loadIdRef = useRef(0);
  const cachedSession = readCachedSession(apiBaseUrl);
  const [session, setSession] = useState<AuthSession>(cachedSession ?? null);
  const [status, setStatus] = useState<AuthSessionStatus>(
    cachedSession === undefined
      ? "loading"
      : cachedSession?.user
        ? "authenticated"
        : "unauthenticated",
  );

  const applySession = useCallback(
    (nextSession: AuthSession) => {
      sessionCache.set(apiBaseUrl, nextSession);
      setSession(nextSession);
      setStatus(nextSession?.user ? "authenticated" : "unauthenticated");
      return nextSession;
    },
    [apiBaseUrl],
  );

  const refreshSession = useCallback(async () => {
    loadIdRef.current += 1;
    setStatus("loading");

    try {
      return applySession(await fetchCachedSession(apiBaseUrl, { force: true }));
    } catch {
      toast.error("Could not check your session. Please try again.");
      return applySession(null);
    }
  }, [apiBaseUrl, applySession]);

  const clearSession = useCallback(() => {
    applySession(null);
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;
    const nextCachedSession = readCachedSession(apiBaseUrl);

    if (nextCachedSession !== undefined) {
      applySession(nextCachedSession);
      return;
    }

    const loadId = loadIdRef.current + 1;
    loadIdRef.current = loadId;
    setStatus("loading");

    void fetchCachedSession(apiBaseUrl)
      .then((nextSession) => {
        if (!cancelled && loadIdRef.current === loadId) {
          applySession(nextSession);
        }
      })
      .catch(() => {
        if (!cancelled && loadIdRef.current === loadId) {
          toast.error("Could not check your session. Please try again.");
          applySession(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, applySession]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      session,
      status,
      user: session?.user ?? null,
      clearSession,
      refreshSession,
    }),
    [session, status, clearSession, refreshSession],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider.");
  }

  return context;
}
