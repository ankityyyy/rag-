import OpenAI from "openai";
import dotenv from "dotenv";

import {User} from "../models/user.js";
import {Product} from "../models/product.js";
import {review} from "../models/review.js";
import {Cart} from "../models/cart.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runDBQuery(question) {
  try {

    // 🔥 Step 1: LLM → Query
    const llmRes = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You convert user questions into DB queries.

Collections:
- users
- products
- reviews
- carts

Return ONLY JSON.

Format:
{
  "collection": "users",
  "operation": "count",
  "filter": {}
}
`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    const raw = llmRes.choices[0].message.content;
    console.log("🔍 RAW:", raw);

    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json);

    console.log("✅ Parsed:", parsed);

    const { collection, operation, filter = {} } = parsed;

    // 🔥 Step 2: Map to Mongoose Models
   const models = {
  user: User,
  product: Product,
  review: review,
  cart: Cart,
};

const normalized = collection.toLowerCase().replace(/s$/, "");
const Model = models[normalized];

console.log("Collection from LLM:", collection);
console.log("Normalized:", normalized);
console.log("Model found:", Model?.modelName);





if (!Model) {
  return { error: "Invalid collection" };
}

    // 🔥 Step 3: Execute

    // COUNT
    if (operation === "count") {
      const count = await Model.countDocuments(filter);
      return { count };
    }

    // FIND
    if (operation === "find") {
      const data = await Model.find(filter).limit(5);
      return data;
    }

    return { error: "Unsupported operation" };

  } catch (err) {
    console.error("❌ DB Error:", err);
    return { error: "DB failed" };
  }
}