import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:3021"
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3021",
    url: "http://127.0.0.1:3021",
    reuseExistingServer: false,
    timeout: 30000
  }
});
