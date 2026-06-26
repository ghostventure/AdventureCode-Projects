import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const appOutputDir = ".next/server/app";
const staticOutputDir = ".next/static";
const deployDir = "deploy-static";
const publicDir = "public";
const protectedStaticPages = [
  "admin.html",
  "client.html",
  "communication.html",
  "data-workflow.html",
  "health.html",
  "manager.html",
  "operations.html",
  "operations-quality.html",
  "platform.html",
  "security.html",
  "users.html"
];

const placeholderApiResponses = {
  "contact-preview": { ok: true, mode: "static-placeholder", emailJob: { status: "queued" } },
  health: { ok: true, mode: "static-placeholder", service: "sample-demo-website" },
  live: { ok: true, mode: "static-placeholder", status: "live" }
};

if (!existsSync(appOutputDir)) {
  throw new Error("Missing .next/server/app. Run npm run build before building deploy-static.");
}

rmSync(deployDir, { force: true, recursive: true });
mkdirSync(deployDir, { recursive: true });

for (const entry of readdirSync(appOutputDir)) {
  if (extname(entry) === ".html") {
    cpSync(join(appOutputDir, entry), join(deployDir, entry));
  }
}

if (existsSync(staticOutputDir)) {
  cpSync(staticOutputDir, join(deployDir, "_next/static"), { recursive: true });
}

if (existsSync(publicDir)) {
  cpSync(publicDir, deployDir, { recursive: true });
}

const robotsBody = join(appOutputDir, "robots.txt.body");
const sitemapBody = join(appOutputDir, "sitemap.xml.body");

if (existsSync(robotsBody)) {
  writeFileSync(join(deployDir, "robots.txt"), readFileSync(robotsBody));
}

if (existsSync(sitemapBody)) {
  writeFileSync(join(deployDir, "sitemap.xml"), readFileSync(sitemapBody));
}

mkdirSync(join(deployDir, "api"), { recursive: true });

for (const [route, body] of Object.entries(placeholderApiResponses)) {
  writeFileSync(join(deployDir, "api", basename(route)), `${JSON.stringify(body, null, 2)}\n`);
}

for (const page of protectedStaticPages) {
  writeFileSync(join(deployDir, page), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Sign in required | Sample Demo Website</title>
    <style>
      :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { display: grid; min-height: 100vh; margin: 0; place-items: center; background: #101512; color: #f8f5eb; }
      main { width: min(680px, calc(100% - 32px)); padding: 32px; border: 1px solid rgba(248, 245, 235, 0.18); border-radius: 8px; background: #162019; }
      p { color: rgba(248, 245, 235, 0.78); line-height: 1.55; }
      a { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; margin-top: 12px; padding: 0 15px; border-radius: 6px; background: #79b58a; color: #07100b; font-weight: 850; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <p>Protected area</p>
      <h1>Sign in to continue</h1>
      <p>This static demo does not publish protected client, manager, admin, workflow, health, security, platform, or user-directory page content for anonymous visitors.</p>
      <a href="/auth">Open sign-in page</a>
    </main>
  </body>
</html>
`);
}

console.log(`Static deploy bundle written to ${deployDir}`);
