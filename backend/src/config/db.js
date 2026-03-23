// import { MongoClient } from "mongodb";

// const client = new MongoClient(process.env.ATLASDB_URL);

// let db;

// export async function connectDB() {
//   await client.connect();

//   // ✅ NORMAL DB (users, products)
//   db = client.db("genai");  
//   console.log("✅ Connected Normal DB:", db.databaseName);
//       const db1 = client.db("genai");
// const db2 = client.db("pdf-rag");
// console.log(await db1.collection("users").find().toArray());
// console.log(await db2.collection("users").find().toArray());
// }

// export function getDB() {
//   return db;
// }