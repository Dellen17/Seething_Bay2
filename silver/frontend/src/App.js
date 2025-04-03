import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import CalendarView from './components/CalendarView';
import Gallery from './components/Gallery';
import GalleryImages from './components/GalleryImages';
import GalleryVideos from './components/GalleryVideos';
import GalleryDocuments from './components/GalleryDocuments';
import GalleryVoiceNotes from './components/GalleryVoiceNotes';
import MoodTracker from './components/MoodTracker';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';
import Logout from './components/Logout';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from './components/ResetPassword';
import ResetPasswordConfirm from './components/ResetPasswordConfirm';
import Layout from './components/Layout';
import About from './components/About';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password-reset" element={<ResetPassword />} />
        <Route path="/reset-password-confirm/:uidb64/:token" element={<ResetPasswordConfirm />} />

        <Route path="/about" element={<About />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <CalendarView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <Layout>
                <Gallery />
              </Layout>
            </ProtectedRoute>
          }
        >
          {/* Nested Routes for Gallery Sub-pages */}
          <Route path="images" element={<GalleryImages />} />
          <Route path="videos" element={<GalleryVideos />} />
          <Route path="documents" element={<GalleryDocuments />} />
          <Route path="voice-notes" element={<GalleryVoiceNotes />} />
        </Route>
        <Route
          path="/mood-tracker"
          element={
            <ProtectedRoute>
              <Layout>
                <MoodTracker />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Logout */}
        <Route path="/logout" element={<Logout />} />

        {/* Fallback Routes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;