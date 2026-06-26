function safeParse(value, fallback = {}) {
  try {
    const parsed = JSON.parse(value || "");
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function initProfileDrafts(options = {}) {
  const {
    form,
    key,
    fields = [],
    onStatus = () => {},
    onRestore = () => {}
  } = options;

  if (!form || !key || !fields.length) return {
    clear() {},
    save() {}
  };
  let saveTimerId = null;
  let lastSavedPayload = "";
  const SAVE_DEBOUNCE_MS = 180;

  function readDraft() {
    return safeParse(localStorage.getItem(key), {});
  }

  function saveDraft() {
    const payload = {};
    fields.forEach((field) => {
      const el = document.getElementById(field.id);
      if (!el) return;
      payload[field.id] = field.read ? field.read(el) : el.value;
    });
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedPayload) return;
    localStorage.setItem(key, serialized);
    lastSavedPayload = serialized;
    onStatus("Draft saved locally while you work.");
  }

  function scheduleSaveDraft() {
    if (saveTimerId) window.clearTimeout(saveTimerId);
    saveTimerId = window.setTimeout(() => {
      saveTimerId = null;
      saveDraft();
    }, SAVE_DEBOUNCE_MS);
  }

  function restoreDraft() {
    const draft = readDraft();
    let hasData = false;
    fields.forEach((field) => {
      const el = document.getElementById(field.id);
      if (!el || !(field.id in draft)) return;
      hasData = hasData || !!draft[field.id];
      if (field.write) field.write(el, draft[field.id]);
      else el.value = draft[field.id];
    });
    if (hasData) {
      lastSavedPayload = JSON.stringify(draft);
      onRestore(draft);
      onStatus("Recovered your last unfinished profile draft.");
    }
  }

  function clearDraft() {
    if (saveTimerId) {
      window.clearTimeout(saveTimerId);
      saveTimerId = null;
    }
    localStorage.removeItem(key);
    lastSavedPayload = "";
    onStatus("Draft cleared. New changes will save automatically.");
  }

  form.addEventListener("input", scheduleSaveDraft);
  form.addEventListener("change", scheduleSaveDraft);
  restoreDraft();

  return {
    clear: clearDraft,
    save: saveDraft
  };
}
