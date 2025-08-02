const { MongoClient } = require('mongodb');
require('dotenv').config();

// Safely load the MongoDB URI
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ Environment variable MONGODB_URI is not defined.");
  process.exit(1); // Fail early
}

// Create a new MongoClient instance with options
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

/**
 * Connects to MongoDB (if not already connected)
 * @returns {Promise<Db>} MongoDB database instance
 */
async function connect() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db(); // Automatically uses DB from URI if not explicitly named

    // Ping to confirm connection
    await db.command({ ping: 1 });
    console.log('✅ MongoDB connected to:', db.databaseName);

    // Optional: List collections for debugging
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name));

    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Fail the app if DB connection fails
  }
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await client.close();
  console.log('👋 MongoDB connection closed (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await client.close();
  console.log('👋 MongoDB connection closed (SIGTERM)');
  process.exit(0);
});

module.exports = { connect, client };
