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

  // Use relative API path for both dev and production
  const API_BASE_URL = '/api/todos';

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoadingTodos(true);
        const response = await axios.get(API_BASE_URL);
        setTodos(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load todos. Please try again.');
      } finally {
        setLoadingTodos(false);
      }
    };
    fetchTodos();
  }, []);

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
      setTodos((prev) =>
        prev.map((todo) => (todo._id === tempId ? response.data : todo))
      );
    } catch (err) {
      setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
      setError(err.response?.data?.error || 'Failed to add todo. Please try again.');
    } finally {
      setAddingTodo(false);
    }
  };

  const toggleTodo = async (id) => {
    const todoToUpdate = todos.find((todo) => todo._id === id);
    if (!todoToUpdate) return;

    try {
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
      await axios.put(`${API_BASE_URL}/${id}`, {
        completed: !todoToUpdate.completed,
      });
    } catch (err) {
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? todoToUpdate : todo))
      );
      setError('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = async (id) => {
    const todoToDelete = todos.find((todo) => todo._id === id);
    if (!todoToDelete) return;

    try {
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
      await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (err) {
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
