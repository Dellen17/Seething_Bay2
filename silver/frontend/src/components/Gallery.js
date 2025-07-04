import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaImage, FaVideo, FaMicrophone, FaFile, FaArrowLeft } from 'react-icons/fa';
import '../styles/Gallery.css';

const Gallery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading] = useState(false);
  const [error] = useState('');

  // Determine the active gallery option based on the current path
  const getActiveClass = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  // Check if we're on the main /gallery route
  const isMainGalleryRoute = location.pathname === '/gallery';

  return (
    <div className="gallery-container">
      {isMainGalleryRoute && (
        <>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft className="back-icon" />
            <span>Back to Dashboard</span>
          </button>

          <h2>Gallery</h2>
          {loading && <p className="loading-message">Loading gallery...</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="gallery-options">
            <Link to="images" className={`gallery-option ${getActiveClass('images')}`}>
              <FaImage className="gallery-icon" />
              <span>Images</span>
            </Link>
            <Link to="videos" className={`gallery-option ${getActiveClass('videos')}`}>
              <FaVideo className="gallery-icon" />
              <span>Videos</span>
            </Link>
            <Link to="documents" className={`gallery-option ${getActiveClass('documents')}`}>
              <FaFile className="gallery-icon" />
              <span>Documents</span>
            </Link>
            <Link to="voice-notes" className={`gallery-option ${getActiveClass('voice-notes')}`}>
              <FaMicrophone className="gallery-icon" />
              <span>Voice Notes</span>
            </Link>
          </div>
        </>
      )}

      <div className="gallery-content">
        <Outlet />
        {isMainGalleryRoute && (
          <p className="gallery-placeholder">
            Select a category above to view your media.
          </p>
        )}
      </div>
    </div>
  );
};

export default Gallery;