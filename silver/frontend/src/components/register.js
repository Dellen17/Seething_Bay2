import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Basic validation for email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        username: username,
        email: email,
        password: password,
      });
      console.log(response.data);
      navigate('/login');
    } catch (error) {
      if (error.response?.data?.email) {
        setError('This email is already registered');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register-container">
      <h2 className="register-heading">Register</h2>
      {error && <p className="register-error">{error}</p>}
      <form onSubmit={handleRegister} className="register-form">
        <input
          id="register-username"
          name="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="register-input"
        />
        <input
          id="register-email"
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
        />
        <div className="password-input-container">
          <input
            id="register-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input password-input"
          />
          <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="password-input-container">
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="register-input password-input"
          />
          <span className="password-toggle-icon" onClick={toggleConfirmPasswordVisibility}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button type="submit" disabled={isLoading} className="register-button">
          {isLoading ? <LoadingSpinner /> : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;