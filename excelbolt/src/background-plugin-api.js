let worker;
let seq = 0;
const pending = new Map();

function ensureWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./background-plugin-worker.js", import.meta.url), { type: "module" });
  worker.addEventListener("message", (event) => {
    const { id, ok, data, error } = event.data || {};
    const task = pending.get(id);
    if (!task) return;
    pending.delete(id);
    if (ok) task.resolve(data);
    else task.reject(new Error(error || "Background plugin request failed"));
  });
  worker.addEventListener("error", (event) => {
    for (const [, task] of pending) {
      task.reject(new Error(event.message || "Background plugin worker crashed"));
    }
    pending.clear();
  });
  return worker;
}

function callWorker(type, payload = {}) {
  const id = ++seq;
  const target = ensureWorker();
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    target.postMessage({ id, type, payload });
  });
}

export const backgroundPluginApi = {
  listPlugins() {
    return callWorker("plugins/list");
  },
  runPlugin(pluginId, payload = {}) {
    return callWorker("plugin/run", { pluginId, ...payload });
  }
};
