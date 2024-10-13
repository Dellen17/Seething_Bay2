import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation to check if fields are not empty
    if (username === '' || password === '') {
      setError('Please fill in both fields');
      return;
    }

    axios.post('http://127.0.0.1:8000/api/login/', {
      username: username,
      password: password,
    })
    .then((response) => {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      console.log("Login successful!");

      // Redirect to the dashboard after login
      navigate('/dashboard'); 
    })
    .catch((error) => {
      setError('Invalid login credentials. Please try again.');
      console.error("There was an error logging in!", error);
    });
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
      <input
        id="login-username"
        name="username"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        id="login-password"
        name="password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
    </div>
  );
}

export default Login;