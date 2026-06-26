export function subscribeWhenVisible(startSubscription) {
  let unsubscribe = null;

  function stop() {
    if (typeof unsubscribe === "function") {
      try {
        unsubscribe();
      } catch {}
    }
    unsubscribe = null;
  }

  function start() {
    if (document.visibilityState === "hidden" || typeof unsubscribe === "function") return;
    const nextUnsubscribe = startSubscription();
    unsubscribe = typeof nextUnsubscribe === "function" ? nextUnsubscribe : null;
  }

  function onVisibilityChange() {
    if (document.visibilityState === "hidden") stop();
    else start();
  }

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", stop, { once: true });
  start();

  return () => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    stop();
  };
}
