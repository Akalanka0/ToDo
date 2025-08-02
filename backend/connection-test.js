const { connectDB } = require('./db');

async function test() {
  try {
    const db = await connectDB();
    console.log('✅ Connection verified');
    
    // Test CRUD operations
    const testCollection = db.collection('testCollection');
    await testCollection.insertOne({ test: new Date() });
    const docs = await testCollection.find().toArray();
    console.log('📝 Test documents:', docs);
    await testCollection.deleteMany({});
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    process.exit();
  }
}

test();