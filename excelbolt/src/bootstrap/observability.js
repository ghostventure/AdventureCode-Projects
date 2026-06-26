import { featureFlags } from "../feature-flags.js";

let sentryInitAttempted = false;

export const bootstrapObservability = async () => {
  if (sentryInitAttempted) return;
  sentryInitAttempted = true;

  if (!featureFlags.sentry) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.warn("Sentry feature flag enabled but VITE_SENTRY_DSN is missing");
    return;
  }

  try {
    const Sentry = await import("@sentry/react");
    Sentry.init({
      dsn,
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACE_SAMPLE_RATE || 0),
      enabled: true,
      environment: import.meta.env.MODE,
    });
  } catch (error) {
    console.warn("Sentry bootstrap skipped", error);
  }
};
