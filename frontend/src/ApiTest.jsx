// src/ApiTest.jsx
import { useEffect, useState } from 'react';

export default function ApiTest() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const testApi = async () => {
    try {
      // Test GET
      const todos = await fetch('http://localhost:3001/api/todos').then(res => res.json());
      
      // Test POST
      const newTodo = await fetch('http://localhost:3001/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'From React frontend' })
      }).then(res => res.json());

      setData({ todos, newTodo });
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div style={{ padding: '1rem', margin: '1rem', border: '1px solid #ccc' }}>
      <h3>API Connection Test</h3>
      {error ? (
        <div style={{ color: 'red' }}>❌ Error: {error}</div>
      ) : data ? (
        <div style={{ color: 'green' }}>
          ✅ Success! Created new todo: {data.newTodo.task}
          <pre>{JSON.stringify(data.todos, null, 2)}</pre>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}