const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;
let db;

async function connectDB() {
  if (db) return db;
  
  client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    serverApi: { 
      version: '1', 
      strict: true,
      deprecationErrors: true 
    }
  });

  try {
    await client.connect();
    db = client.db();
    await db.command({ ping: 1 });
    console.log('✅ MongoDB Connected');
    return db;
  } catch (err) {
    console.error('❌ Connection Error:', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

module.exports = { connectDB };