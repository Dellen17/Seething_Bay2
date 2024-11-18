import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ResetPasswordConfirm.css';

const ResetPasswordConfirm = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const { uidb64, token } = useParams(); // Capture uidb64 and token from URL
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Send the new password to Django backend using uidb64 and token
            const response = await axios.post(`http://127.0.0.1:8000/api/reset-password-confirm/${uidb64}/${token}/`, {
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            setMessage(response.data.message || 'Password reset successful.');

            // Clear stored token after reset
            localStorage.removeItem('authToken');

            // Redirect to login after a short delay for user feedback
            setTimeout(() => navigate('/login'), 2000); // 2-second delay
        } catch (error) {
            setMessage(error.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-confirm-container">
            <h2 className="reset-password-confirm-title">Confirm Password Reset</h2>
            <form onSubmit={handleSubmit} className="reset-password-confirm-form">
                <label htmlFor="new-password" className="reset-password-confirm-label">New Password:</label>
                <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="reset-password-confirm-input"
                />
                <label htmlFor="confirm-password" className="reset-password-confirm-label">Confirm New Password:</label>
                <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="reset-password-confirm-input"
                />
                <button 
                    type="submit" 
                    disabled={loading} 
                    className={`reset-password-confirm-button ${loading ? 'loading' : ''}`}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
            {message && <p className="reset-password-confirm-message">{message}</p>}
        </div>
    );
};

export default ResetPasswordConfirm;