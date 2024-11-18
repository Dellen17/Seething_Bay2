import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ element }) => {
  const accessToken = localStorage.getItem('access_token');

  if (accessToken) {
    try {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        // Token is expired; remove it and redirect to login
        localStorage.removeItem('access_token');
        return <Navigate to="/login" replace />;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('access_token');
      return <Navigate to="/login" replace />;
    }
  }

  // Render the passed component if authenticated
  return accessToken ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;