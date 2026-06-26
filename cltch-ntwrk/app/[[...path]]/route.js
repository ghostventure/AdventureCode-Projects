import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const rootDir = process.cwd();
const blockedSegments = new Set([
  ".firebase",
  ".git",
  ".next",
  "android",
  "docs",
  "functions",
  "ios",
  "mobile-web",
  "native-android-kotlin",
  "native-ios-swift",
  "node_modules",
  "release"
]);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function cleanSegments(rawSegments = []) {
  return rawSegments
    .map((segment) => decodeURIComponent(String(segment || "")).trim())
    .filter(Boolean);
}

function isBlocked(segments) {
  return segments.some((segment) => segment.startsWith(".") || blockedSegments.has(segment));
}

function resolveRequestPath(rawSegments = []) {
  const segments = cleanSegments(rawSegments);
  if (!segments.length) return path.join(rootDir, "index.html");
  if (isBlocked(segments)) return null;

  const requested = path.normalize(path.join(rootDir, ...segments));
  if (!requested.startsWith(rootDir)) return null;
  return requested;
}

function withHtmlFallback(filePath) {
  if (!filePath || path.extname(filePath)) return [filePath];
  return [filePath, `${filePath}.html`, path.join(filePath, "index.html")];
}

async function readFirstExisting(candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const fileStat = await stat(candidate);
      if (!fileStat.isFile()) continue;
      return {
        filePath: candidate,
        body: await readFile(candidate)
      };
    } catch {}
  }
  return null;
}

function headersFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const cacheControl = ext === ".html" || ext === ".js" || ext === ".css"
    ? "no-store, max-age=0"
    : "public, max-age=3600";

  return {
    "Content-Type": contentTypes[ext] || "application/octet-stream",
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff"
  };
}

export async function GET(_request, context) {
  const resolvedPath = resolveRequestPath(context.params?.path || []);
  const result = await readFirstExisting(withHtmlFallback(resolvedPath));

  if (!result) {
    const fallback404 = await readFirstExisting([path.join(rootDir, "404.html")]);
    if (fallback404) {
      return new Response(fallback404.body, {
        status: 404,
        headers: headersFor(fallback404.filePath)
      });
    }
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.body, {
    status: 200,
    headers: headersFor(result.filePath)
  });
}
