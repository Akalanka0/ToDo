const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI, {
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  serverApi: { 
    version: '1', 
    strict: true,
    deprecationErrors: true 
  }
});

let db;

async function connect() {
  if (db) return db;
  
  try {
    await client.connect();
    db = client.db();
    
    // Verify connection
    await db.command({ ping: 1 });
    console.log('✅ MongoDB connected to:', db.databaseName);
    
    // Log collections
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name));
    
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = { connect, client };