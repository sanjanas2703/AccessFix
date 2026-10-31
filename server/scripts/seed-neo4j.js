// Seeds the curated knowledge graph. Safe to re-run: it MERGEs by id and only
// touches the labels below, so no other data in the database is changed.
import '../env.js';
import { FIXES, GUIDELINES, ISSUES, USER_NEEDS } from '../knowledge/graph.js';
import { closeDriver, getDriver, queryOptions } from '../services/neo4j.js';

const CONSTRAINTS = ['AccessibilityIssue', 'UserNeed', 'SuggestedFix', 'Guideline'].map(
  (label) => `CREATE CONSTRAINT ${label.toLowerCase()}_id IF NOT EXISTS FOR (n:${label}) REQUIRE n.id IS UNIQUE`,
);

const SEED_STATEMENTS = [
  [
    `UNWIND $rows AS row
     MERGE (g:Guideline {id: row.id})
     SET g.title = row.title, g.level = row.level, g.url = row.url`,
    GUIDELINES,
  ],
  [
    `UNWIND $rows AS row
     MERGE (n:UserNeed {id: row.id})
     SET n.area = row.area, n.name = row.name, n.description = row.description`,
    USER_NEEDS,
  ],
  [
    `UNWIND $rows AS row
     MERGE (f:SuggestedFix {id: row.id})
     SET f.title = row.title, f.description = row.description, f.adjustmentType = row.adjustmentType
     WITH f, row
     MATCH (n:UserNeed {id: row.need})
     MERGE (n)-[:ADDRESSED_BY]->(f)`,
    FIXES,
  ],
  [
    `UNWIND $rows AS row
     MERGE (i:AccessibilityIssue {id: row.id})
     SET i.source = row.source, i.area = row.area, i.name = row.name
     WITH i, row
     UNWIND row.needs AS needId
     MATCH (n:UserNeed {id: needId})
     MERGE (i)-[:AFFECTS]->(n)`,
    ISSUES,
  ],
  [
    `UNWIND $rows AS row
     MATCH (i:AccessibilityIssue {id: row.id})
     UNWIND row.references AS guidelineId
     MATCH (g:Guideline {id: guidelineId})
     MERGE (i)-[r:REFERENCES]->(g)
     SET r.confidence = CASE row.source WHEN 'axe' THEN 'axe-rule-tag' ELSE 'possible' END`,
    ISSUES,
  ],
];

const COUNT_QUERY = `
  MATCH (n) WHERE n:AccessibilityIssue OR n:UserNeed OR n:SuggestedFix OR n:Guideline
  RETURN labels(n)[0] AS label, count(n) AS total ORDER BY label`;

async function main() {
  const driver = getDriver();
  const options = queryOptions();
  await driver.verifyConnectivity(options);

  for (const statement of CONSTRAINTS) await driver.executeQuery(statement, {}, options);
  for (const [statement, rows] of SEED_STATEMENTS) await driver.executeQuery(statement, { rows }, options);

  const { records } = await driver.executeQuery(COUNT_QUERY, {}, options);
  for (const record of records) console.log(`${record.get('label')}: ${record.get('total').toNumber()}`);
  console.log('Neo4j seed complete.');
}

main()
  .catch((err) => {
    console.error(`Seed failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(closeDriver);
