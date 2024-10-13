import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';  // Ensure correct capitalization for component imports
import Register from './components/register';
import Dashboard from './components/dashboard';
import EditEntry from './components/EditEntry';  // Import the EditEntry component
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/edit/:id" element={<ProtectedRoute element={<EditEntry />} />} />
        <Route path="/" element={<Navigate to="/login" />} /> {/* Default route */}
      </Routes>
    </Router>
  );
};

export default App;