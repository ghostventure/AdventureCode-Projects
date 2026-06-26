import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { configureAuthPersistence } from "./firebase.js";
import { queryClient } from "./bootstrap/query-client.js";
import { bootstrapObservability } from "./bootstrap/observability.js";

const App = lazy(() => import("../excelbolt.jsx"));

configureAuthPersistence();
bootstrapObservability();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

const fallbackStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg,#F4F8F2,#E8F5E9)",
  color: "#1B5E20",
  fontFamily: "'DM Sans','Segoe UI',sans-serif",
};

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <Suspense
      fallback={
        <div style={fallbackStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>ExcelBolt</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Loading secure workspace...</div>
          </div>
        </div>
      }
    >
      <App />
    </Suspense>
  </QueryClientProvider>
);
