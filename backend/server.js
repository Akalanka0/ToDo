require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('./db');
const { ObjectId } = require('mongodb');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json({ limit: '10kb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/todos', async (req, res) => {
  try {
    const db = await connect();
    const todos = await db.collection('todos')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(todos);
  } catch (err) {
    console.error('GET /api/todos error:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    if (!req.body.task?.trim()) {
      return res.status(400).json({ error: 'Task is required' });
    }

    const db = await connect();
    const newTodo = {
      task: req.body.task.trim(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('todos').insertOne(newTodo);
    
    res.status(201).json({
      _id: result.insertedId,
      ...newTodo
    });
  } catch (err) {
    console.error('POST /api/todos error:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const db = await connect();
    const updates = {
      ...req.body,
      updatedAt: new Date()
    };

    const result = await db.collection('todos').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(result.value);
  } catch (err) {
    console.error('PUT /api/todos error:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const db = await connect();
    const result = await db.collection('todos').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/todos error:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    database: 'connected', // Add this if you want to verify DB status
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function start() {
  await connect();
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  });
}

start().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});