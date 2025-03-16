import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner'; // Import the spinner
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  // Helper function to get a new access token using the refresh token
  const refreshAccessToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    
    if (refresh_token) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refresh_token,
        });
        localStorage.setItem('access_token', response.data.access);
        return response.data.access;
      } catch (error) {
        console.log('Token refresh failed:', error);
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return null;
      }
    }
    return null;
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username === '' || password === '') {
      setError('Please fill in both fields');
      return;
    }

    setIsLoading(true); // Start loading
    setError(''); // Clear any previous errors

    try {
      // Try to log in and get the access and refresh tokens
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: username,
        password: password,
      });

      // Store the access and refresh tokens in localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      navigate('/');
    } catch (error) {
      if (error.response?.status === 401) {
        // Token is invalid or expired, attempt to refresh the token
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
          // Try the login again with the new access token
          try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
              username: username,
              password: password,
            });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            navigate('/');
          } catch (err) {
            setError('Invalid login credentials. Please try again.');
          }
        }
      } else {
        setError('Invalid login credentials. Please try again.');
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-header">Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          id="login-username"
          name="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : 'Login'} {/* Show spinner when loading */}
        </button>
      </form>
      <p className="redirect-link">
        Don't have an account? 
        <Link to="/register" className="register-link">
          <button className="register-button">Register</button>
        </Link>
      </p>
      <p className="forgot-password">
        <Link to="/password-reset" className="password-reset-link">
          <button className="forgot-button">Forgot Password?</button>
        </Link>
      </p>
    </div>
  );
};

export default Login;