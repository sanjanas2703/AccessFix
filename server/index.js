import path from 'node:path';
import { rootDir } from './env.js';
import cors from 'cors';
import express from 'express';
import healthRoutes from './routes/health.js';
import scanRoutes from './routes/scan.js';

// Keep in sync with the proxy target in client/vite.config.js.
const PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json());
// The same demo page the sandbox scans, so it can also be opened in a local tab.
app.use('/demo', express.static(path.join(rootDir, 'demo-broken-site')));
app.use('/api/health', healthRoutes);
app.use('/api/scan', scanRoutes);

app.listen(PORT, () => {
  console.log(`AccessFix server listening on http://localhost:${PORT}`);
});
