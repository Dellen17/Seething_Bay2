import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component }) => {
  const isAuthenticated = localStorage.getItem('access_token'); // Check if token exists

  return isAuthenticated ? Component : <Navigate to="/login" />;
};

export default ProtectedRoute;