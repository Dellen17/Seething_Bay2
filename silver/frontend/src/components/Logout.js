import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa'; // Import logout icon

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the JWT token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Redirect to login page
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      <FaSignOutAlt className="logout-icon" />
      <span>Logout</span>
    </button>
  );
};

export default Logout;