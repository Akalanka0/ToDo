import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [addingTodo, setAddingTodo] = useState(false);
  const [error, setError] = useState(null);

  // API configuration
  const API_BASE_URL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001/api/todos'
      : '/api/todos';

  // Fetch todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoadingTodos(true);
        const response = await axios.get(API_BASE_URL);
        setTodos(response.data);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load todos. Please try again.');
      } finally {
        setLoadingTodos(false);
      }
    };

    fetchTodos();
  }, [API_BASE_URL]);

  // Add new todo with optimistic update and temp ID
  const addTodo = async () => {
    if (!task.trim()) {
      setError('Task cannot be empty');
      return;
    }

    const tempId = uuidv4();
    const newTodo = {
      _id: tempId,
      task: task.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      setAddingTodo(true);
      setTodos((prev) => [newTodo, ...prev]);
      setTask('');
      setError(null);

      const response = await axios.post(API_BASE_URL, { task: newTodo.task });

      // Replace temp todo with real todo from server (with real _id)
      setTodos((prev) =>
        prev.map((todo) => (todo._id === tempId ? response.data : todo))
      );
    } catch (err) {
      console.error('Add error:', err);
      setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
      setError(err.response?.data?.error || 'Failed to add todo. Please try again.');
    } finally {
      setAddingTodo(false);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id) => {
    const todoToUpdate = todos.find((todo) => todo._id === id);
    if (!todoToUpdate) return;

    try {
      // Optimistic update
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );

      // API call
      await axios.put(`${API_BASE_URL}/${id}`, {
        completed: !todoToUpdate.completed,
      });
    } catch (err) {
      console.error('Toggle error:', err);
      // Revert optimistic update
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? todoToUpdate : todo))
      );
      setError('Failed to update todo. Please try again.');
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    const todoToDelete = todos.find((todo) => todo._id === id);
    if (!todoToDelete) return;

    try {
      // Optimistic update
      setTodos((prev) => prev.filter((todo) => todo._id !== id));

      // API call
      await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (err) {
      console.error('Delete error:', err);
      // Revert optimistic update
      setTodos((prev) => [...prev, todoToDelete]);
      setError('Failed to delete todo. Please try again.');
    }
  };

  return (
    <div className="app">
      <h1>ToDo App</h1>

      {error && (
        <div className="error" onClick={() => setError(null)}>
          {error} (click to dismiss)
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter task..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          disabled={loadingTodos || addingTodo}
        />
        <button onClick={addTodo} disabled={loadingTodos || addingTodo || !task.trim()}>
          {addingTodo ? 'Adding...' : 'Add'}
        </button>
      </div>

      {loadingTodos && todos.length === 0 ? (
        <div className="loading">Loading todos...</div>
      ) : (
        <ul className="todo-list">
          {todos.length === 0 ? (
            <li className="empty-state">No tasks yet. Add one above!</li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo._id}
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
              >
                <span
                  className="todo-text"
                  onClick={() => toggleTodo(todo._id)}
                  style={{ cursor: 'pointer' }}
                >
                  {todo.task}
                  <span className="todo-date">
                    {' '}
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                </span>
                <button
                  className="delete-btn"
                  onClick={() => deleteTodo(todo._id)}
                  disabled={loadingTodos || addingTodo}
                  aria-label="Delete todo"
                >
                  🗑️
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default App;
