import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import { moods } from './MoodSelector';
import '../styles/GalleryImages.css';

const GalleryImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAllImages = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('access_token');
    let allEntries = [];
    let nextPage = `${process.env.REACT_APP_API_URL}/api/entries/`;

    try {
      while (nextPage) {
        const response = await axios.get(nextPage, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allEntries = [...allEntries, ...response.data.results.entries];
        nextPage = response.data.next;
      }
      const entriesWithImages = allEntries.filter((entry) => entry.image);
      setImages(entriesWithImages);
    } catch (err) {
      setError('Failed to fetch images. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllImages();
  }, [fetchAllImages]);

  const handleRetry = () => {
    fetchAllImages();
  };

  const handleImageClick = (entryId) => {
    navigate(`/edit/${entryId}`);
  };

  return (
    <div className="gallery-images-container">
      <button className="back-button" onClick={() => navigate('/gallery')}>
        ← Back to Gallery
      </button>

      <h2>Images</h2>
      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
          <p className="loading-message">Loading images...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : images.length > 0 ? (
        <div className="images-grid">
          {images.map((entry) => {
            const moodData = moods.find((m) => m.label === entry.mood);
            const MoodIcon = moodData?.icon;
            return (
              <div
                key={entry.id}
                className="image-item"
                onClick={() => handleImageClick(entry.id)}
              >
                <img
                  src={entry.image}  // Removed process.env.REACT_APP_API_URL
                  alt={`Entry ${entry.id}`}
                  className="gallery-image"
                  loading="lazy"
                />
                <div className="image-overlay">
                  <p className="image-timestamp">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                  {entry.mood && (
                    <div className="image-mood">
                      {MoodIcon && (
                        <MoodIcon size="20px" color={moodData?.color} />
                      )}
                      <span>{entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="no-content">No images found.</p>
      )}
    </div>
  );
};

export default GalleryImages;