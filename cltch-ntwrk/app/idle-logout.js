import { signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

export const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
export const RESUME_TARGET_KEY = "cltch_resume_target_v1";
const WARNING_WINDOW_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart", "click"];
const ACTIVITY_THROTTLE_MS = 1000;

export function clearResumeTarget() {
  try {
    localStorage.removeItem(RESUME_TARGET_KEY);
  } catch {}
}

export function readResumeTarget() {
  try {
    const value = localStorage.getItem(RESUME_TARGET_KEY) || "";
    if (!value.startsWith("/")) return null;
    if (value.includes("://")) return null;
    if (/[\r\n\t]/.test(value)) return null;
    return value;
  } catch {
    return null;
  }
}

export function writeResumeTarget(value = window.location.pathname + window.location.search + window.location.hash) {
  try {
    const normalized = String(value || "").trim();
    if (!normalized || !normalized.startsWith("/")) return;
    if (normalized.includes("://")) return;
    if (/[\r\n\t]/.test(normalized)) return;
    localStorage.setItem(RESUME_TARGET_KEY, normalized);
  } catch {}
}

function ensureWarningModal() {
  let modal = document.getElementById("cltchIdleWarning");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "cltchIdleWarning";
  modal.style.cssText = [
    "position:fixed",
    "right:18px",
    "bottom:18px",
    "width:min(360px,calc(100vw - 36px))",
    "padding:16px",
    "border-radius:18px",
    "border:1px solid #3b3b3b",
    "background:rgba(12,12,12,0.96)",
    "color:#f0f0f0",
    "box-shadow:0 20px 40px rgba(0,0,0,0.35)",
    "z-index:4000",
    "display:none"
  ].join(";");
  modal.innerHTML = [
    '<div style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#f5a623;margin-bottom:8px;">Session Warning</div>',
    '<div id="cltchIdleWarningText" style="font-size:14px;line-height:1.55;color:#d7d7d7;margin-bottom:12px;">You will be signed out soon due to inactivity.</div>',
    '<button id="cltchStaySignedInBtn" type="button" style="width:100%;min-height:44px;border:0;border-radius:12px;background:#f5a623;color:#000;font-weight:700;cursor:pointer;">Stay Signed In</button>'
  ].join("");
  document.body.appendChild(modal);
  return modal;
}

export function installIdleLogout(auth, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (window.__cltchIdleLogoutInstalled) return;
  window.__cltchIdleLogoutInstalled = true;

  let logoutTimerId = null;
  let warningTimerId = null;
  let warningIntervalId = null;
  const modal = ensureWarningModal();
  const warningText = modal.querySelector("#cltchIdleWarningText");
  const staySignedInBtn = modal.querySelector("#cltchStaySignedInBtn");
  let lastActivityAt = 0;

  function hideWarning() {
    modal.style.display = "none";
    if (warningIntervalId) window.clearInterval(warningIntervalId);
    warningIntervalId = null;
  }

  function showWarning() {
    hideWarning();
    let secondsLeft = Math.max(1, Math.round(WARNING_WINDOW_MS / 1000));
    modal.style.display = "block";
    warningText.textContent = `You will be signed out in ${secondsLeft} seconds due to inactivity.`;
    warningIntervalId = window.setInterval(() => {
      secondsLeft = Math.max(0, secondsLeft - 1);
      warningText.textContent = `You will be signed out in ${secondsLeft} seconds due to inactivity.`;
      if (secondsLeft <= 0) hideWarning();
    }, 1000);
  }

  const resetTimer = () => {
    hideWarning();
    if (logoutTimerId) window.clearTimeout(logoutTimerId);
    if (warningTimerId) window.clearTimeout(warningTimerId);
    warningTimerId = window.setTimeout(showWarning, Math.max(0, timeoutMs - WARNING_WINDOW_MS));
    logoutTimerId = window.setTimeout(async () => {
      writeResumeTarget();
      try {
        await signOut(auth);
      } catch {}
      window.location.href = "auth.html?reason=idle-timeout";
    }, timeoutMs);
  };

  const handleActivity = () => {
    const now = Date.now();
    if (now - lastActivityAt < ACTIVITY_THROTTLE_MS) return;
    lastActivityAt = now;
    resetTimer();
  };

  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, handleActivity, { passive: true });
  });

  staySignedInBtn?.addEventListener("click", resetTimer);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      resetTimer();
    }
  });

  resetTimer();
}
