import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl) {
  console.error("❌ MONGODB_URL not found in environment variables!");
  process.exit(1);
}

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function clearDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongodbUrl);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Found ${collections.length} collections:`);
    collections.forEach((col) => console.log(`   - ${col.name}`));

    // Ask for confirmation
    console.log("\n⚠️  WARNING: This will delete ALL data from ALL collections!");
    const answer = await askQuestion(
      '\nType "DELETE" to confirm (case-sensitive): '
    );

    if (answer !== "DELETE") {
      console.log("\n❌ Operation cancelled. No data was deleted.");
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("\n🗑️  Deleting all data...");

    // Delete all documents from each collection
    let totalDeleted = 0;
    for (const collection of collections) {
      const result = await db.collection(collection.name).deleteMany({});
      console.log(
        `   ✓ Deleted ${result.deletedCount} documents from ${collection.name}`
      );
      totalDeleted += result.deletedCount;
    }

    console.log(`\n✅ Successfully deleted ${totalDeleted} total documents!`);
    console.log("🧹 Database is now clean.");

    rl.close();
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    rl.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
clearDatabase();
