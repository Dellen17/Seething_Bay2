import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return null;
      }
    }
    return null;
  };

  // Handle standard login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setError('Please fill in both fields');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: username,
        password: password,
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/');
    } catch (error) {
      if (error.response?.status === 401) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
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
      setIsLoading(false);
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async () => {
    setIsLoading(true);
    setError('');
    try {
      window.location.href = 'http://127.0.0.1:8000/api/auth/google/';
    } catch (error) {
      setError('Google login failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle callback from Google (after redirect)
  const handleGoogleCallback = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const access = urlParams.get('access');
    const refresh = urlParams.get('refresh');
    if (access && refresh) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      navigate('/');
    } else {
      setError('Google login failed. No tokens received.');
    }
    setIsLoading(false);
  }, [navigate, setError]);

  // Check if this is a callback from Google
  React.useEffect(() => {
    if (window.location.pathname === '/login' && window.location.search) {
      handleGoogleCallback();
    }
  }, [handleGoogleCallback]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <GoogleOAuthProvider clientId="99374703049-tnvk7nu7cm03a6sj9r08uc50gltklpbh.apps.googleusercontent.com">
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
          <div className="password-input-container">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input password-input"
            />
            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : 'Login'}
          </button>
        </form>

        {/* "or" Separator and Google Login */}
        <div className="login-options">
          <div className="separator">
            <span className="or-text">or</span>
          </div>
          <div className="google-login">
            <button
              onClick={handleGoogleSuccess}
              className="google-button"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Login with Google'}
            </button>
          </div>
        </div>

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
    </GoogleOAuthProvider>
  );
};

export default Login;