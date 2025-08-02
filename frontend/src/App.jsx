import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch todos
  useEffect(() => {
    setLoading(true);
    axios.get('/api/todos')
      .then(res => {
        setTodos(res.data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch todos');
      })
      .finally(() => setLoading(false));
  }, []);

  // Add todo
  const addTodo = () => {
    if (!task.trim()) return;
    const newTodo = { task, completed: false };
    setTodos([newTodo, ...todos]); // Optimistic update
    setTask('');
    
    axios.post('/api/todos', { task })
      .then(res => setTodos([res.data, ...todos.filter(t => t !== newTodo)]))
      .catch(err => {
        console.error(err);
        setTodos(todos.filter(t => t !== newTodo)); // Revert if error
        setError('Failed to add todo');
      });
  };

  // Toggle completion
  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo => 
      todo._id === id ? {...todo, completed: !todo.completed} : todo
    );
    setTodos(updatedTodos); // Optimistic update
    
    axios.put(`/api/todos/${id}`, { 
      completed: !todos.find(todo => todo._id === id).completed 
    })
      .catch(err => {
        console.error(err);
        setTodos(todos); // Revert if error
        setError('Failed to update todo');
      });
  };

  // Delete todo
  const deleteTodo = (id) => {
    const originalTodos = todos;
    setTodos(todos.filter(todo => todo._id !== id)); // Optimistic update
    
    axios.delete(`/api/todos/${id}`)
      .catch(err => {
        console.error(err);
        setTodos(originalTodos); // Revert if error
        setError('Failed to delete todo');
      });
  };

  return (
    <div className="app">
      <h1>ToDo App</h1>
      {error && <div className="error">{error}</div>}
      <div className="input-container">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter task..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          disabled={loading}
        />
        <button onClick={addTodo} disabled={loading || !task.trim()}>
          Add
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="todo-list">
          {todos.length === 0 ? (
            <li>No tasks yet. Add one above!</li>
          ) : (
            todos.map(todo => (
              <li key={todo._id} className={todo.completed ? 'completed' : ''}>
                <span onClick={() => toggleTodo(todo._id)}>
                  {todo.task}
                </span>
                <button onClick={() => deleteTodo(todo._id)} disabled={loading}>
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