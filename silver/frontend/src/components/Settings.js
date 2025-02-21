import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required.');
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.put(
        'http://127.0.0.1:8000/api/update-email/', // Replace with your backend endpoint
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Email updated successfully.');
      setError('');
    } catch (err) {
      setError('Failed to update email. Please try again.');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Password and confirmation are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.put(
        'http://127.0.0.1:8000/api/update-password/', // Replace with your backend endpoint
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Password updated successfully.');
      setError('');
    } catch (err) {
      setError('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="settings-container">
      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate('/')} // Navigate back to the dashboard
      >
        ← Back to Dashboard
      </button>

      <h2>Settings</h2>

      {/* Update Email Section */}
      <div className="settings-section">
        <h3>Update Email</h3>
        <form onSubmit={handleUpdateEmail}>
          <input
            type="email"
            placeholder="New Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="settings-input"
          />
          <button type="submit" className="settings-button">
            Update Email
          </button>
        </form>
      </div>

      {/* Update Password Section */}
      <div className="settings-section">
        <h3>Update Password</h3>
        <form onSubmit={handleUpdatePassword}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="settings-input"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="settings-input"
          />
          <button type="submit" className="settings-button">
            Update Password
          </button>
        </form>
      </div>

      {/* Display Success or Error Messages */}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
};

export default Settings;