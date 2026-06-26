import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { clearResumeTarget } from "./idle-logout.js";
import { persistActiveRole } from "./user-db.js";

function routeForMode(mode, hasProfile) {
  if (mode === "host") return hasProfile ? "host.html" : "host-profile.html";
  return hasProfile ? "musician-matched-gigs.html" : "musician-profile.html";
}

async function hasProfile(db, userId, mode) {
  const collectionName = mode === "host" ? "hosts" : "musicians";
  const snap = await getDoc(doc(db, collectionName, userId));
  return snap.exists();
}

export function bindModeSwitch(modeSwitch, { db, userId, currentMode, onError } = {}) {
  if (!modeSwitch || !db || !userId || !currentMode) return;
  if (modeSwitch.dataset.boundModeSwitch === "1") return;
  modeSwitch.dataset.boundModeSwitch = "1";

  const modeButtons = [...modeSwitch.querySelectorAll("[data-mode]")];
  let busy = false;

  const syncModeButtons = (mode, isBusy = false) => {
    modeSwitch.classList.toggle("busy", isBusy);
    modeButtons.forEach((button) => {
      const isActive = button.dataset.mode === mode;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.disabled = isBusy;
    });
  };

  syncModeButtons(currentMode, false);

  modeSwitch.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button || busy) return;
    const targetMode = button.dataset.mode;
    if (!targetMode || targetMode === currentMode) return;

    busy = true;
    syncModeButtons(targetMode, true);

    try {
      clearResumeTarget();
      const safeMode = await persistActiveRole(db, userId, targetMode);
      const targetHasProfile = await hasProfile(db, userId, safeMode);
      window.location.replace(routeForMode(safeMode, targetHasProfile));
    } catch (err) {
      busy = false;
      syncModeButtons(currentMode, false);
      if (typeof onError === "function") onError(err);
      else console.error("Mode switch failed:", err);
    }
  });
}
