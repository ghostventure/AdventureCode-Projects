"use client";

import { LogOut, TimerReset } from "lucide-react";
import { useSessionSignal } from "./SessionProvider";

function formatRemaining(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function SessionStatus() {
  const { isTimedOut, remainingMs, resetTimer, shouldWarn, signOut, timeoutMinutes } = useSessionSignal();

  return (
    <div
      className={`session-status${shouldWarn ? " session-status-warning" : ""}${isTimedOut ? " session-status-ended" : ""}`}
      data-session-state={isTimedOut ? "signed-out" : "active"}
      role="status"
    >
      <span>{isTimedOut ? "Signed out" : `Idle ${formatRemaining(remainingMs)}`}</span>
      <small>{timeoutMinutes} min auto sign-out</small>
      <button type="button" onClick={() => resetTimer()} aria-label="Reset inactivity timer">
        <TimerReset size={15} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => signOut("manual")} aria-label="Sign out">
        <LogOut size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
