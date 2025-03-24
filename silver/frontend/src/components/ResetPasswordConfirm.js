import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/ResetPasswordConfirm.css';

const ResetPasswordConfirm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reset-password-confirm/${uidb64}/${token}/`, 
        {
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );
      setMessage(response.data.message || 'Password reset successful.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    if (message.includes('successful')) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [message, navigate]);

  return (
    <div className="reset-password-confirm-container">
      <h2 className="reset-password-confirm-title">Confirm Password Reset</h2>
      <form onSubmit={handleSubmit} className="reset-password-confirm-form">
        <label htmlFor="new-password" className="reset-password-confirm-label">New Password:</label>
        <div className="password-input-container">
          <input
            id="new-password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="reset-password-confirm-input"
            placeholder="New Password"
          />
          <span className="password-toggle-icon" onClick={toggleNewPasswordVisibility}>
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <label htmlFor="confirm-password" className="reset-password-confirm-label">Confirm New Password:</label>
        <div className="password-input-container">
          <input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="reset-password-confirm-input"
            placeholder="Confirm New Password"
          />
          <span className="password-toggle-icon" onClick={toggleConfirmPasswordVisibility}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="reset-password-confirm-button"
        >
          {isLoading ? <LoadingSpinner /> : 'Reset Password'}
        </button>
      </form>
      {message && <p className="reset-password-confirm-message">{message}</p>}
    </div>
  );
};

export default ResetPasswordConfirm;