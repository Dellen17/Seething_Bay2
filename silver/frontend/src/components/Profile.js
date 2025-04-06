import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        axios
            .get(`${process.env.REACT_APP_API_URL}/api/user-profile/`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setUser(response.data);
                setProfilePicture(
                    response.data.profile_picture
                        ? `${response.data.profile_picture}?t=${new Date().getTime()}`
                        : null
                );
            })
            .catch((error) => {
                setError('Failed to load profile.');
            });
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('profile_picture', file);
            const token = localStorage.getItem('access_token');

            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/upload-profile-picture/`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                // Append a timestamp to the URL to avoid caching
                setProfilePicture(`${response.data.profile_picture}?t=${new Date().getTime()}`);
                setIsEditing(false);
                setSuccessMessage('Profile picture updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
            } catch (error) {
                setError('Failed to upload profile picture.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Handle image load error by falling back to the placeholder
    const handleImageError = () => {
        setProfilePicture(null);
    };

    if (error) return <p className="error-message">{error}</p>;
    if (!user) return <p className="loading-message">Loading profile...</p>;

    return (
        <div className="profile-container">
            <button className="back-button" onClick={() => navigate('/')}>
                ← Back to Dashboard
            </button>

            <div className="profile-card">
                <div className="profile-header">
                    <h2>{user.username}'s Profile</h2>
                    <div className="profile-picture-container">
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="profile-picture"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="profile-picture-placeholder">No Picture</div>
                        )}
                        {isEditing ? (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="profile-picture-input"
                                    disabled={isUploading}
                                />
                                {isUploading && <div className="upload-spinner">Uploading...</div>}
                                <button
                                    className="cancel-edit-button"
                                    onClick={() => setIsEditing(false)}
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className="edit-profile-picture-button"
                                onClick={() => setIsEditing(true)}
                                aria-label="Edit profile picture"
                            >
                                Edit Picture
                            </button>
                        )}
                    </div>
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <p className="profile-bio">A place to reflect and remember.</p>
                </div>
            </div>

            <div className="profile-details-card">
                <h3>Details</h3>
                <div className="profile-details-grid">
                    <div className="profile-detail">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{user.email}</span>
                    </div>
                    <div className="profile-detail">
                        <span className="detail-label">Joined</span>
                        <span className="detail-value">
                            {new Date(user.date_joined).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="profile-detail">
                        <span className="detail-label">Entries</span>
                        <span className="detail-value">{user.total_entries}</span>
                    </div>
                    <div className="profile-detail">
                        <span className="detail-label">Images</span>
                        <span className="detail-value">{user.images}</span>
                    </div>
                    <div className="profile-detail">
                        <span className="detail-label">Videos</span>
                        <span className="detail-value">{user.videos}</span>
                    </div>
                    <div className="profile-detail">
                        <span className="detail-label">Documents</span>
                        <span className="detail-value">{user.documents}</span>
                    </div>
                    <div className="profile-detail">
                        <span className="detail-label">Voice Notes</span>
                        <span className="detail-value">{user.voice_notes}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;