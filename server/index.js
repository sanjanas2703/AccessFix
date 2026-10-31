import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import scanRoutes from './routes/scan.js';

// .env lives at the repo root, one level above this file.
const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

// Keep in sync with the proxy target in client/vite.config.js.
const PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/scan', scanRoutes);

app.listen(PORT, () => {
  console.log(`AccessFix server listening on http://localhost:${PORT}`);
});
