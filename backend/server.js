require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and Collection names
const DB_NAME = 'todoDB';
const COLLECTION_NAME = 'todos';

// Connect to MongoDB
async function connectToDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    return client.db(DB_NAME).collection(COLLECTION_NAME);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

// Initialize
let todosCollection;
(async () => {
  todosCollection = await connectToDB();
})();

// Routes
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await todosCollection.find().sort({ createdAt: -1 }).toArray();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    if (!req.body.task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    
    const newTodo = {
      task: req.body.task,
      completed: false,
      createdAt: new Date()
    };
    
    const result = await todosCollection.insertOne(newTodo);
    res.status(201).json({ ...newTodo, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const update = {};
    if (req.body.task !== undefined) update.task = req.body.task;
    if (req.body.completed !== undefined) update.completed = req.body.completed;
    
    const result = await todosCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const result = await todosCollection.deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});