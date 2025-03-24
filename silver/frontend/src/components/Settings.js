import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time validation for email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Real-time validation for password length
  const validatePassword = (password) => password.length >= 8;

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Email is required.');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/update-email/`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Email updated successfully.');
      setEmail('');
    } catch (err) {
      setError('Failed to update email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!password || !confirmPassword) {
      setError('Password and confirmation are required.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/update-password/`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate('/')}
        aria-label="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      <h2 className="settings-title">Settings</h2>

      {/* Loading State with Spinner */}
      {loading && (
        <div className="loading-overlay">
          <LoadingSpinner />
        </div>
      )}

      {/* Update Email Section */}
      <div className="settings-card">
        <h3 className="settings-subtitle">Update Email</h3>
        <form onSubmit={handleUpdateEmail} className="settings-form">
          <input
            type="email"
            placeholder="New Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`settings-input ${!email || validateEmail(email) ? '' : 'error'}`}
            aria-label="New Email"
          />
          <button type="submit" className="settings-button" disabled={loading}>
            Update Email
          </button>
        </form>
      </div>

      {/* Update Password Section */}
      <div className="settings-card">
        <h3 className="settings-subtitle">Update Password</h3>
        <form onSubmit={handleUpdatePassword} className="settings-form">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`settings-input ${!password || validatePassword(password) ? '' : 'error'}`}
            aria-label="New Password"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`settings-input ${password === confirmPassword || !confirmPassword ? '' : 'error'}`}
            aria-label="Confirm Password"
          />
          <button type="submit" className="settings-button" disabled={loading}>
            Update Password
          </button>
        </form>
      </div>

      {/* Display Success or Error Messages */}
      {error && <p className="error-message" role="alert">{error}</p>}
      {success && <p className="success-message" role="alert">{success}</p>}
    </div>
  );
};

export default Settings;