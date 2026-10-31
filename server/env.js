import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// .env lives at the repo root, one level above this file. Import this module
// first, so services see the values when they read process.env.
export const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });
