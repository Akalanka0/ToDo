require('dotenv').config();
const { MongoClient } = require('mongodb');

// Load MongoDB URI from environment variable
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ Environment variable MONGODB_URI is not defined.");
  process.exit(1); // Fail early if missing
}

// Create a new MongoClient instance with options including TLS fix
const client = new MongoClient(uri, {
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  useUnifiedTopology: true,          // recommended for stable topology handling
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
});

let db;

/**
 * Connects to MongoDB (if not connected yet)
 * @returns {Promise<Db>} MongoDB database instance
 */
async function connect() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db(); // Uses database from URI if specified

    // Confirm connection is alive
    await db.command({ ping: 1 });
    console.log('✅ MongoDB connected to:', db.databaseName);

    // Optional: log collections for debugging
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name));

    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit if connection fails
  }
}

// Graceful shutdown handlers
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
