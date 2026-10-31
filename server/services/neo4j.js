// Teammate area: graph/AI.
import neo4j from 'neo4j-driver';

let driver;

// Connection setup. Creating a driver does not open a connection, and the stubs
// below do not call this yet, so the app runs without a Neo4j instance.
export function getDriver() {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
    );
  }
  return driver;
}

export async function saveScan(scan) {
  // TODO: Open a getDriver() session and MERGE the scan with Cypher:
  // (:Scan)-[:FOUND]->(:Issue)-[:IN]->(:Component)-[:ON]->(:Page), and link
  // each issue to a (:DisabilityGroup) and (:WcagCriterion).
  return { saved: true, scanId: scan.scanId };
}

export async function getWorstComponents(limit = 5) {
  // TODO: Query components ordered by unfixed issue count, weighted by severity,
  // and return the top `limit`. Not called yet: wire it to IssueGraph.vue.
  return [
    { component: 'HeroBanner', issueCount: 2, highSeverityCount: 1 },
    { component: 'SiteHeader', issueCount: 2, highSeverityCount: 1 },
    { component: 'ContactForm', issueCount: 2, highSeverityCount: 0 },
    { component: 'ArticleBody', issueCount: 2, highSeverityCount: 0 },
    { component: 'PromoVideo', issueCount: 1, highSeverityCount: 1 },
  ].slice(0, limit);
}
