import { z } from "zod";

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_MAINTENANCE_MODE: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_ANALYTICS_ENABLED: z.enum(["true", "false"]).optional()
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE,
    NEXT_PUBLIC_ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED
  });
}

export function getEnvReadiness() {
  const env = getPublicEnv();
  const requiredKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID"
  ];

  return requiredKeys.map((key) => ({
    key,
    ready: Boolean(env[key])
  }));
}

export function validateEnvironmentContract() {
  const readiness = getEnvReadiness();
  const missing = readiness.filter((item) => !item.ready).map((item) => item.key);

  return {
    ok: missing.length === 0,
    missing,
    optional: [
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_MAINTENANCE_MODE",
      "NEXT_PUBLIC_ANALYTICS_ENABLED",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    ]
  };
}
