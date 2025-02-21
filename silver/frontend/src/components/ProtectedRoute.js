import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('access_token');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('access_token');
    return <Navigate to="/login" replace />;
  }

  return children; // Return children instead of element
};

export default ProtectedRoute;