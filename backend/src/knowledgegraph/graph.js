import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  )
);

export async function addFact(subject, relation, object) {

  const session = driver.session();

  try {

    const safeRelation = relation
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .toUpperCase();

    const query = `
      MERGE (s:Entity {name: $subject})
      MERGE (o:Entity {name: $object})
      MERGE (s)-[:${safeRelation}]->(o)
    `;

    await session.run(query, {
      subject,
      object
    });

   

  } catch (error) {

    console.error("Neo4j error:", error);

  } finally {

    await session.close();
  }
}

export async function extractEntities(text) {

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",

    messages: [
      {
        role: "system",
        content: `
Extract the important entity names from the text.

Return ONLY a JSON array of strings.

Example:
["Node.js", "V8", "Express"]

If no entities exist, return [].
`
      },
      {
        role: "user",
        content: text
      }
    ],

    temperature: 0
  });

  return JSON.parse(
    response.choices[0].message.content
  );
}

export async function getRelatedFacts(entities) {

  const session = driver.session();

  try {

    const result = await session.run(
      `
      MATCH (e:Entity)-[r]-(related)
      WHERE e.name IN $entities

      RETURN e.name AS entity,
             type(r) AS relation,
             related.name AS related
      `,
      { entities }
    );

    return result.records.map(record => ({
      entity: record.get("entity"),
      relation: record.get("relation"),
      related: record.get("related")
    }));

  } finally {

    await session.close();
  }
}