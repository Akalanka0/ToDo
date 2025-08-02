const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI not set.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connect() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db(); // default from URI
    await db.command({ ping: 1 });
    console.log("✅ MongoDB connected:", db.databaseName);
    return db;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await client.close();
  console.log("👋 MongoDB closed (SIGINT)");
  process.exit(0);
});

module.exports = { connect, client };
