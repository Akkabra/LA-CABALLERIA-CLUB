import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export function isServerlessEnv(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

export function getWritableDataDir(): string {
  const candidates = isServerlessEnv()
    ? [path.join(os.tmpdir(), 'la-caballeria-data')]
    : [path.join(ROOT_DIR, '.data'), path.join(os.tmpdir(), 'la-caballeria-data')];

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return dir;
    } catch {
      // Try next writable directory candidate
    }
  }

  return os.tmpdir();
}
