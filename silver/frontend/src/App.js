import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';
import Logout from './components/Logout';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from './components/ResetPassword';
import ResetPasswordConfirm from './components/ResetPasswordConfirm';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password-reset" element={<ResetPassword />} />
        {/* Update the path to accept both uidb64 and token parameters */}
        <Route path="/reset-password-confirm/:uidb64/:token" element={<ResetPasswordConfirm />} />

        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/edit/:id" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/calendar" element={<CalendarView />} />


        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;