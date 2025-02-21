import React from 'react';
import { Link, Outlet, Routes, Route, useNavigate } from 'react-router-dom';
import GalleryImages from './GalleryImages';
import GalleryVideos from './GalleryVideos';
import GalleryVoiceNotes from './GalleryVoiceNotes';
import ProtectedRoute from './ProtectedRoute';
import { FaImage, FaVideo, FaMicrophone, FaArrowLeft } from 'react-icons/fa'; // Import icons
import '../styles/Gallery.css';

const Gallery = () => {
  const navigate = useNavigate();

  return (
    <div className="gallery-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/')}>
        <FaArrowLeft className="back-icon" />
        <span>Back to Dashboard</span>
      </button>

      <h2>Gallery</h2>
      <div className="gallery-options">
        <Link to="images" className="gallery-option">
          <FaImage className="gallery-icon" />
          <span>Images</span>
        </Link>
        <Link to="videos" className="gallery-option">
          <FaVideo className="gallery-icon" />
          <span>Videos</span>
        </Link>
        <Link to="voice-notes" className="gallery-option">
          <FaMicrophone className="gallery-icon" />
          <span>Voice Notes</span>
        </Link>
      </div>

      {/* Render nested routes here */}
      <Routes>
        <Route
          path="images"
          element={
            <ProtectedRoute>
              <GalleryImages />
            </ProtectedRoute>
          }
        />
        <Route
          path="videos"
          element={
            <ProtectedRoute>
              <GalleryVideos />
            </ProtectedRoute>
          }
        />
        <Route
          path="voice-notes"
          element={
            <ProtectedRoute>
              <GalleryVoiceNotes />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Outlet will render the matched nested route */}
      <Outlet />
    </div>
  );
};

export default Gallery;