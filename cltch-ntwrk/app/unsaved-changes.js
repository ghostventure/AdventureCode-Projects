export function installUnsavedChangesGuard({ form, statusEl, message } = {}) {
  if (!form) return { markSaved() {}, markDirty() {}, isDirty() { return false; } };

  let dirty = false;
  const warning = message || "You have unsaved changes. Leave this page anyway?";

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function markDirty() {
    dirty = true;
    if (form.dataset.dirty !== "1") form.dataset.dirty = "1";
  }

  function markSaved() {
    dirty = false;
    delete form.dataset.dirty;
  }

  function isDirty() {
    return dirty;
  }

  const onInput = () => markDirty();
  form.addEventListener("input", onInput);
  form.addEventListener("change", onInput);

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = warning;
  });

  document.addEventListener("click", (event) => {
    if (!dirty) return;
    const link = event.target.closest("a[href]");
    if (!link) return;
    if (link.hasAttribute("data-bypass-dirty-check")) return;
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    if (window.confirm(warning)) {
      markSaved();
      setStatus("");
      return;
    }
    event.preventDefault();
  });

  return { markSaved, markDirty, isDirty };
}
