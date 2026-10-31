// Teammate area: graph/AI.
import neo4j from 'neo4j-driver';

let driver;

// Creating a driver does not open a connection.
export function getDriver() {
  // Aura's downloaded credentials file uses NEO4J_USERNAME.
  const { NEO4J_URI, NEO4J_PASSWORD } = process.env;
  const user = process.env.NEO4J_USERNAME || process.env.NEO4J_USER;
  if (!NEO4J_URI || !user || !NEO4J_PASSWORD) {
    throw new Error('Neo4j is not configured: set NEO4J_URI, NEO4J_USERNAME and NEO4J_PASSWORD in .env.');
  }
  driver ??= neo4j.driver(NEO4J_URI, neo4j.auth.basic(user, NEO4J_PASSWORD), {
    connectionTimeout: 10_000,
  });
  return driver;
}

export const queryOptions = () => ({ database: process.env.NEO4J_DATABASE || undefined });

export async function closeDriver() {
  await driver?.close();
  driver = undefined;
}

const GUIDANCE_QUERY = `
  UNWIND $issueIds AS issueId
  MATCH (issue:AccessibilityIssue {id: issueId})
  OPTIONAL MATCH (issue)-[:AFFECTS]->(need:UserNeed)
  OPTIONAL MATCH (need)-[:ADDRESSED_BY]->(fix:SuggestedFix)
  WITH issue, need, collect(DISTINCT fix { .id, .title, .description, .adjustmentType }) AS fixes
  WITH issue, collect(need { .id, .name, .description, fixes: fixes }) AS needs
  OPTIONAL MATCH (issue)-[reference:REFERENCES]->(guideline:Guideline)
  WITH issue, needs, collect(guideline { .id, .title, .level, .url, confidence: reference.confidence }) AS guidelines
  RETURN issue { .id, .name, .source, .area } AS issue, needs, guidelines
`;

// Returns a Map of issue id to { issue, needs, guidelines }.
export async function getGuidance(issueIds) {
  const { records } = await getDriver().executeQuery(GUIDANCE_QUERY, { issueIds }, queryOptions());
  return new Map(records.map((record) => [record.get('issue').id, record.toObject()]));
}

export async function countSeededIssues() {
  const { records } = await getDriver().executeQuery(
    'MATCH (issue:AccessibilityIssue) RETURN count(issue) AS total',
    {},
    queryOptions(),
  );
  return records[0].get('total').toNumber();
}
