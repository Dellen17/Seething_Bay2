import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const token = localStorage.getItem('access_token');
      
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }
      
        axios.get('http://127.0.0.1:8000/api/user-profile/', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setUser(response.data);
            setProfilePicture(response.data.profile_picture ? `http://127.0.0.1:8000${response.data.profile_picture}` : null);
        })
        .catch(error => {
            console.error('Error fetching profile:', error.response ? error.response.data : error.message);
            setError('Failed to load profile.');
        });
    }, []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile_picture', file);
    
            const token = localStorage.getItem('access_token');
            axios.post('http://127.0.0.1:8000/api/upload-profile-picture/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(response => {
                setProfilePicture(response.data.profile_picture);
                setIsEditing(false);
            })
            .catch(error => {
                console.error('Error uploading profile picture:', error);
                setError('Failed to upload profile picture.');
            });
        }
    };

    if (error) return <p className="error-message">{error}</p>;
    if (!user) return <p className="loading-message">Loading profile...</p>;

    return (
        <div className="profile-container">
            {/* Back Button */}
            <button
                className="back-button"
                onClick={() => navigate('/')} // Navigate back to the dashboard
            >
                ← Back to Dashboard
            </button>

            <div className="profile-header">
                <h2>{user.username}'s Profile</h2>
                <div className="profile-picture-container">
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt="Profile"
                            className="profile-picture"
                        />
                    ) : (
                        <div className="profile-picture-placeholder">No Picture</div>
                    )}
                    {isEditing ? (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="profile-picture-input"
                        />
                    ) : (
                        <button
                            className="edit-profile-picture-button"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile Picture
                        </button>
                    )}
                </div>
            </div>
            <div className="profile-details">
                <div className="profile-detail">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{user.email}</span>
                </div>
                <div className="profile-detail">
                    <span className="detail-label">Joined:</span>
                    <span className="detail-value">{new Date(user.date_joined).toLocaleDateString()}</span>
                </div>
                <div className="profile-detail">
                    <span className="detail-label">Total Entries:</span>
                    <span className="detail-value">{user.total_entries}</span>
                </div>
                <div className="profile-detail">
                    <span className="detail-label">Images:</span>
                    <span className="detail-value">{user.images}</span>
                </div>
                <div className="profile-detail">
                    <span className="detail-label">Videos:</span>
                    <span className="detail-value">{user.videos}</span>
                </div>
                <div className="profile-detail">
                    <span className="detail-label">Documents:</span>
                    <span className="detail-value">{user.documents}</span>
                </div>
                <div className="profile-detail">
                    <span className="detail-label">Voice Notes:</span>
                    <span className="detail-value">{user.voice_notes}</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;