// Reports whether Daytona, Neo4j and Nosana are usable. Prints no secrets.
import '../env.js';
import { checkIntegrations } from '../routes/health.js';
import { closeDriver } from '../services/neo4j.js';

const results = await checkIntegrations();
for (const [name, { status, detail }] of Object.entries(results)) {
  console.log(`${name}: ${status} - ${detail}`);
}
await closeDriver();
process.exitCode = Object.values(results).every((result) => result.status === 'ok') ? 0 : 1;
