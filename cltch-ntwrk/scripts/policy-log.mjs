import { appendFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const logPath = resolve('docs/policy-revisions.md');
const args = process.argv.slice(2);
const entry = args.join(' ') || 'Policy update triggered.';
const timestamp = new Date().toISOString().split('T')[0];

async function main() {
  const marker = `- **${timestamp}** — ${entry}\n`;
  await appendFile(logPath, marker, { encoding: 'utf8' });
  console.log('Policy log appended:', marker.trim());
}

main().catch((error) => {
  console.error('Failed to log policy change:', error);
  process.exit(1);
});
