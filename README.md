# AccessFix

Paste a public URL. AccessFix opens it in a Daytona sandbox, gathers accessibility evidence, retrieves guidance from Neo4j, asks a Nosana-hosted model to explain the findings, and lets you preview supported adjustments in the sandbox.

**Scope is deliberately limited to three areas:** blindness / screen-reader support, colour blindness (with related contrast checks), and motion sensitivity. AccessFix gives no overall score, and it is not a WCAG certification or a claim that a page is accessible.

## Setup

Requires Node.js 22.12 or later, the team's Daytona sandbox, a Neo4j instance, and a Nosana endpoint.

```bash
npm install
cp .env.example .env      # Then fill in the values
npm run sandbox:setup     # Starts the shared sandbox if stopped and installs Playwright into it
npm run seed              # Seeds the Neo4j knowledge graph. Safe to re-run
npm run check:services    # Confirms all three services work
npm run dev
```

Open http://localhost:5173. Click **Scan the bundled demo page instead**, or enter a URL.

The API runs on http://localhost:3001, and Vite proxies `/api` to it. To change the port, update both `server/index.js` and `client/vite.config.js`.

The sandbox auto-stops after 15 idle minutes. AccessFix then reports that clearly rather than starting a shared sandbox by itself: run `npm run sandbox:setup` again. Installed files survive a stop.

## Chrome extension

`extension/public/` holds the manifest and service worker. The side panel is the Vue client, built in extension mode. There is no content script, because all scanning and previews happen in Daytona. The extension stores only the backend URL: API keys stay in the server's `.env`.

```bash
npm run build:extension
```

In `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select `extension/dist`. After changing code, run the build again and click the extension's reload icon. Backend changes do not need a rebuild, but do need the server restarted.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the API and client |
| `npm test` | Runs unit tests. No credentials needed |
| `npm run build` | Builds the client |
| `npm run build:extension` | Builds the unpacked Chrome extension into `extension/dist` |
| `npm run seed` | Seeds Neo4j with `MERGE`, touching only the four labels below |
| `npm run sandbox:setup` | Starts the sandbox if needed, uploads scripts, runs `npm install` in it |
| `npm run check:services` | Checks Daytona, Neo4j and Nosana. Prints no secrets |

## Folder map

| Folder | Teammate area | What it does |
| --- | --- | --- |
| `sandbox-scripts/` | Sandbox/scanners | Runs inside the sandbox: `scan.js`, `colorblind.js`, `retest.js` |
| `sandbox-scripts/lib/` | Sandbox/scanners | Reusable checks, adjustments and network guard. No server or Daytona dependency, so an extension can reuse them later |
| `server/services/daytona.js` | Sandbox/scanners | Connects to the existing sandbox and runs jobs. Never creates or deletes a sandbox |
| `server/services/neo4j.js` | Graph/AI | Neo4j connection and the guidance query |
| `server/knowledge/graph.js` | Graph/AI | The curated knowledge that gets seeded |
| `server/services/recommendations.js` | Graph/AI | Decides what is offered, using graph guidance |
| `server/services/nosana.js` | Graph/AI | Model verification, explanations and output validation |
| `server/services/compare.js` | Shared | Compares findings before and after a preview |
| `server/routes/` | Shared | API routes and the scan pipeline |
| `client/` | Frontend/demo | Vue 3 app. Start at `src/views/ScanView.vue` |
| `demo-broken-site/` | Frontend/demo | Controlled page with known issues in all three areas. Also served at http://localhost:3001/demo/ |
| `extension/` | Frontend/demo | Chrome extension manifest and service worker |

`sandbox-scripts/` has its own `package.json` because it installs in the sandbox, not on your machine. It is not part of the root `npm install`.

`server/scoring.js`, `server/services/fixer.js`, `server/services/vision.js`, `client/src/components/ScoreRadar.vue` and `client/src/components/IssueGraph.vue` are from the earlier skeleton and are no longer used. `chart.js` and `vue-chartjs` are only needed by `ScoreRadar.vue`.

## How a scan flows

1. `POST /api/scan` with `{ "url": "..." }` or `{ "demo": true }`. The backend validates the URL and returns `{ "scanId": "..." }`.
2. Jobs run one at a time, moving through `queued`, `connecting`, `scanning`, `retrieving`, `explaining` and `done`, or `failed`.
3. Daytona runs Chromium, axe-core and the heuristics. The browser closes and temp files are removed after each job.
4. Neo4j returns guidance for the rule IDs actually found.
5. Nosana explains the evidence and guidance. Its output is validated before display.
6. The client polls `GET /api/scan/:id` every second.
7. `POST /api/scan/:id/preview` with `{ "adjustmentIds": [...] }` applies the selected adjustments to a fresh page load, then re-runs every check. `DELETE` discards the result.

Scan state is held in memory, so it is lost when the server restarts.

If Daytona fails, the scan fails. If Neo4j or Nosana fails, the scan evidence is still shown and the UI says what is unavailable. Nothing is replaced with mock data.

## Finding types

| Type | Meaning |
| --- | --- |
| `automated_violation` | An axe rule failed |
| `heuristic_observation` | Something was measured, such as motion. It is not a confirmed violation |
| `manual_review` | A person must decide, such as colour-only meaning or whether a name is useful |

AI suggestions are a separate, labelled field on a finding. They never change its type.

## Knowledge graph

```
(:AccessibilityIssue)-[:AFFECTS]->(:UserNeed)-[:ADDRESSED_BY]->(:SuggestedFix)
(:AccessibilityIssue)-[:REFERENCES {confidence}]->(:Guideline)
```

- `AccessibilityIssue.id` is an axe rule ID or a heuristic ID, and `source` is `axe` or `heuristic`.
- `REFERENCES.confidence` is `axe-rule-tag` for axe rules, or `possible` for heuristics.
- An adjustment is offered only when the scan found it feasible and the graph links that issue to a `SuggestedFix` with the matching `adjustmentType`. So when Neo4j is unavailable, no adjustments are offered.

To add a rule, update `sandbox-scripts/lib/rules.js` and `server/knowledge/graph.js`, then re-run `npm run seed`. A unit test fails if the two disagree.

## Adjustments

These are the only changes AccessFix can make. They live in `sandbox-scripts/lib/adjustments.js`, have validated parameters, and apply to one sandbox page load. Model output cannot add or alter them.

| Type | What it does | Limits |
| --- | --- | --- |
| `reduced-motion` | Requests `prefers-reduced-motion`, shortens CSS animation, pauses `<video>` and `<marquee>` | Cannot stop script-driven movement, canvas or animated images |
| `contrast-color` | Moves text colour the minimum needed to reach the required ratio | Does not address colour-only meaning |
| `aria-label-from-context` | Names a field from an adjacent unassociated label | Offered only with that context. Labels are never invented |
| `status-text-label` | Adds text from a status class name, such as `error` | The finding stays a review item, because a script cannot confirm the meaning |

## Network safety

All Chromium traffic is forced through `sandbox-scripts/lib/proxy.js`. It resolves each host, refuses private and reserved addresses, and dials the validated IP, so this covers redirects, subrequests, WebSockets and DNS rebinding. The backend validates the URL first using the same rules.

The bundled demo page runs on an ephemeral loopback port inside the sandbox. It is the only loopback address the proxy allows, and only for that job. A caller cannot select it with a URL.

## Known limitations

- **Most public sites cannot be scanned on the current Daytona tier.** Tier 1 and 2 organisations can only reach essential services, and sandbox settings cannot override this. `nodejs.org`, `github.com`, `docs.github.com` and `gitlab.com` work. Wikipedia, W3C and Google are refused, and the scan fails with an explanation. Scanning any site needs Tier 3 or above.
- Only the first viewport is captured in screenshots.
- Adjustments apply to the top-level page, not to iframes or shadow DOM.
- Pages that need a login are out of scope.
- Only the first 30 findings are sent to the model, so later findings have no AI suggestion.
- Scan results are lost when the server restarts.
