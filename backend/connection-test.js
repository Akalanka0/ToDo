require('dotenv').config(); // Load environment variables
const { MongoClient, ServerApiVersion } = require('mongodb');

// Always use environment variables for credentials
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 5000,  // 5 seconds connection timeout
  socketTimeoutMS: 30000,  // 30 seconds socket timeout
  maxPoolSize: 10          // Connection pool size
});

async function testConnection() {
  try {
    await client.connect();
    
    // Test both admin ping and your actual database
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged admin database successfully");
    
    // Test your actual database connection
    const db = client.db("todoDB");
    await db.command({ ping: 1 });
    console.log("✅ Connected to todoDB successfully");
    
    return true;
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    return false;
  } finally {
    await client.close();
  }
}

// Enhanced test with better error handling
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});