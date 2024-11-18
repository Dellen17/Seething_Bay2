import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/password-reset/', { email });
            setMessage(response.data.message || 'Check your email for a reset link.');
        } catch (error) {
            setMessage(error.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
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
                    disabled={loading} 
                    className={`reset-password-button ${loading ? 'loading' : ''}`}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
            {message && <p className="reset-password-message">{message}</p>}
        </div>
    );
};

export default ResetPassword;