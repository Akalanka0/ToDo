import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");

  // Fetch todos from backend
  useEffect(() => {
    axios.get('http://localhost:3001/todos')
      .then(res => setTodos(res.data));
  }, []);

  // Add new todo
  const addTodo = () => {
    axios.post('http://localhost:3001/todos', { task })
      .then(res => setTodos([...todos, res.data]));
    setTask("");
  };

  return (
    <div className="App">
      <h1>ToDo App</h1>
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter task"
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>{todo.task}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;