import React, { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/password-reset/`, { email });
      setMessage(response.data.message || 'Check your email for a reset link.');
      setEmail('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2 className="reset-password-title">Password Reset</h2>
      <form onSubmit={handleSubmit} className="reset-password-form">
        <label htmlFor="email" className="reset-password-label">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="reset-password-input"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="reset-password-button"
        >
          {isLoading ? <LoadingSpinner /> : 'Send Reset Link'}
        </button>
      </form>
      {message && <p className="reset-password-message">{message}</p>}
    </div>
  );
};

export default ResetPassword;