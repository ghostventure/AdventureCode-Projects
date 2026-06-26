"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  getRemainingSessionMs,
  getSessionDeadline,
  isSessionExpired,
  SESSION_CHANNEL_NAME,
  SESSION_TIMEOUT_MINUTES,
  SESSION_WARNING_MS
} from "../../lib/session-policy";

const SessionContext = createContext(null);

const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart", "visibilitychange"];
const DEMO_ROLE_KEY = "sample-demo-role";

function getStoredDemoRole() {
  if (typeof window === "undefined") return null;

  const role = window.localStorage.getItem(DEMO_ROLE_KEY);
  return ["client", "manager", "admin"].includes(role) ? role : null;
}

function writeDemoRoleCookie(role) {
  if (typeof document === "undefined") return;

  if (!role) {
    document.cookie = `${DEMO_ROLE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${DEMO_ROLE_KEY}=${role}; Path=/; Max-Age=3600; SameSite=Lax`;
}

export function SessionProvider({ children }) {
  const channelRef = useRef(null);
  const [deadline, setDeadline] = useState(() => getSessionDeadline());
  const [remainingMs, setRemainingMs] = useState(() => getRemainingSessionMs(deadline));
  const [signedOutReason, setSignedOutReason] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedRole = getStoredDemoRole();
    setRole(storedRole);
    writeDemoRoleCookie(storedRole);
    setIsAuthReady(true);
  }, []);

  const resetTimer = useCallback((broadcast = true) => {
    const nextDeadline = getSessionDeadline();
    setDeadline(nextDeadline);
    setRemainingMs(getRemainingSessionMs(nextDeadline));
    setSignedOutReason(null);

    if (broadcast) {
      channelRef.current?.postMessage({ type: "activity", deadline: nextDeadline });
    }
  }, []);

  const signOut = useCallback((reason = "inactivity", broadcast = true) => {
    setRemainingMs(0);
    setSignedOutReason(reason);
    setRole(null);
    window.localStorage.removeItem(DEMO_ROLE_KEY);
    writeDemoRoleCookie(null);

    if (broadcast) {
      channelRef.current?.postMessage({ type: "sign-out", reason });
    }
  }, []);

  const signInAs = useCallback((nextRole = "client") => {
    const normalizedRole = ["client", "manager", "admin"].includes(nextRole) ? nextRole : "client";
    window.localStorage.setItem(DEMO_ROLE_KEY, normalizedRole);
    writeDemoRoleCookie(normalizedRole);
    setRole(normalizedRole);
    resetTimer(false);
  }, [resetTimer]);

  useEffect(() => {
    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(SESSION_CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === "activity" && event.data.deadline) {
          setDeadline(event.data.deadline);
          setRemainingMs(getRemainingSessionMs(event.data.deadline));
          setSignedOutReason(null);
        }

        if (event.data?.type === "sign-out") {
          signOut(event.data.reason || "inactivity", false);
        }
      };
    }

    return () => {
      channelRef.current?.close();
    };
  }, [signOut]);

  useEffect(() => {
    const handleActivity = () => {
      if (document.visibilityState === "hidden") return;
      resetTimer();
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [resetTimer]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextRemainingMs = getRemainingSessionMs(deadline);
      setRemainingMs(nextRemainingMs);

      if (isSessionExpired(deadline)) {
        signOut("inactivity");
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [deadline, signOut]);

  const value = useMemo(() => {
    const isTimedOut = Boolean(signedOutReason);

    return {
      deadline,
      isAuthenticated: Boolean(role) && !isTimedOut,
      isAuthReady,
      isTimedOut,
      remainingMs,
      role,
      shouldWarn: remainingMs > 0 && remainingMs <= SESSION_WARNING_MS,
      signedOutReason,
      signInAs,
      signOut,
      resetTimer,
      timeoutMinutes: SESSION_TIMEOUT_MINUTES
    };
  }, [deadline, isAuthReady, remainingMs, resetTimer, role, signInAs, signOut, signedOutReason]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionSignal() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionSignal must be used inside SessionProvider.");
  }

  return context;
}
