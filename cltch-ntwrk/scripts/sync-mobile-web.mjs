import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'mobile-web');

const STATIC_DIRS = ['app', 'icons', 'n', 'scripts'];
const ROOT_FILE_EXTENSIONS = new Set(['.html', '.css', '.js', '.webmanifest']);

async function ensureCleanDir(dir) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

async function copyEntry(name) {
  const source = path.join(rootDir, name);
  const target = path.join(outDir, name);
  await cp(source, target, { recursive: true });
}

async function main() {
  await ensureCleanDir(outDir);

  for (const dir of STATIC_DIRS) {
    await copyEntry(dir);
  }

  const topLevelFiles = await readdir(rootDir, { withFileTypes: true });
  for (const entry of topLevelFiles) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!ROOT_FILE_EXTENSIONS.has(ext) && !['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) continue;
    await copyEntry(entry.name);
  }

  console.log(`Mobile web bundle prepared at ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
