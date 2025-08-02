require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const { ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/todos', async (req, res) => {
  try {
    const db = await connectDB();
    const todos = await db.collection('todos')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    if (!req.body.task?.trim()) {
      return res.status(400).json({ error: 'Task is required' });
    }

    const db = await connectDB();
    const result = await db.collection('todos').insertOne({
      task: req.body.task.trim(),
      completed: false,
      createdAt: new Date()
    });

    res.status(201).json({
      _id: result.insertedId,
      ...req.body,
      completed: false,
      createdAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection('todos').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
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
    const db = await connectDB();
    const result = await db.collection('todos').deleteOne({ 
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

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});