# AccessFix

Paste a website URL. AccessFix scans it in a Daytona sandbox, stores the issues in Neo4j, uses an LLM to propose fixes, re-tests, and shows how the score for each disability group changes.

**This is a skeleton.** The app runs end to end on mock data. Daytona, Neo4j, the LLM and Nosana are not called, and any URL gives the same results.

## Setup

Requires Node.js 22.12 or later.

```bash
npm install
cp .env.example .env   # Optional for now: nothing reads these values until the stubs are replaced
npm run dev
```

Open http://localhost:5173, enter any URL and click **Scan**. A mock scan takes about 6 seconds.

The API runs on http://localhost:3001, and Vite proxies `/api` to it. To change the port, update both `server/index.js` and `client/vite.config.js`.

## Folder map

| Folder | Teammate area | What it does |
| --- | --- | --- |
| `sandbox-scripts/` | Sandbox/scanners | Code that runs inside the Daytona sandbox: `scan.js`, `colorblind.js`, `retest.js` |
| `server/services/daytona.js` | Sandbox/scanners | Creates sandboxes, runs scripts, destroys sandboxes. Holds the mock issues |
| `server/services/neo4j.js` | Graph/AI | Neo4j connection, `saveScan`, `getWorstComponents` |
| `server/services/fixer.js` | Graph/AI | `proposeFixes`: LLM-generated fixes |
| `server/services/vision.js` | Graph/AI | `analyzeScreenshot`: finds visual issues in screenshots |
| `server/scoring.js` | Graph/AI | `computeScores`: 0-100 score for each group |
| `server/routes/scan.js` | Shared | API routes and `runPipeline`, which calls every service in order |
| `client/` | Frontend/demo | Vue 3 app. Start at `src/views/ScanView.vue` |
| `demo-broken-site/` | Frontend/demo | The site to scan in the demo |

`sandbox-scripts/` has its own `package.json` because it installs in the sandbox, not on your machine. It is not part of the root `npm install`.

## How a scan flows

1. `POST /api/scan` with `{ "url": "..." }` returns `{ "scanId": "..." }` straight away.
2. `runPipeline` moves the scan through `queued`, `scanning`, `patching`, `retesting` and `done`, or `failed` on an error.
3. The client polls `GET /api/scan/:id` every second and updates the page.
4. At `done`, the client shows the radar chart, issue list and placeholders.

Scan state is held in memory, so it is lost when the server restarts.

## Replacing the stubs

Find every remaining task with:

```bash
grep -rn "TODO:" server client/src sandbox-scripts demo-broken-site
```

Keep the scan result shape unchanged, because the client and server both depend on it:

```json
{
  "scanId": "string",
  "url": "string",
  "status": "queued | scanning | patching | retesting | done | failed",
  "sandboxEvents": [{ "time": "ISO string", "event": "string" }],
  "issues": [{
    "id": "string",
    "type": "string",
    "selector": "string",
    "component": "string",
    "page": "string",
    "wcag": "string",
    "group": "blind | colourblind | motor | deaf | cognitive",
    "severity": "low | medium | high",
    "description": "string",
    "fixed": false
  }],
  "scoresBefore": { "blind": 0, "colourblind": 0, "motor": 0, "deaf": 0, "cognitive": 0, "overall": 0 },
  "scoresAfter": { "blind": 0, "colourblind": 0, "motor": 0, "deaf": 0, "cognitive": 0, "overall": 0 }
}
```
