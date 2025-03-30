import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LazyLoad from 'react-lazy-load';
import LoadingSpinner from './LoadingSpinner';
import { moods } from './MoodSelector';
import '../styles/GalleryVideos.css';

const GalleryVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAllVideos = useCallback(async () => {
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
      const entriesWithVideos = allEntries.filter((entry) => entry.video);
      setVideos(entriesWithVideos);
    } catch (err) {
      setError('Failed to fetch videos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllVideos();
  }, [fetchAllVideos]);

  const handleRetry = () => {
    fetchAllVideos();
  };

  const handleVideoClick = (entryId) => {
    navigate(`/edit/${entryId}`);
  };

  return (
    <div className="gallery-videos-container">
      <button className="back-button" onClick={() => navigate('/gallery')}>
        ← Back to Gallery
      </button>

      <h2>Videos</h2>
      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
          <p className="loading-message">Loading videos...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : videos.length > 0 ? (
        <div className="videos-grid">
          {videos.map((entry) => {
            const moodData = moods.find((m) => m.label === entry.mood);
            const MoodIcon = moodData?.icon;
            return (
              <div
                key={entry.id}
                className="video-item"
                onClick={() => handleVideoClick(entry.id)}
              >
                <LazyLoad height={200} offset={100}>
                  <video
                    src={entry.video}
                    controls
                    className="gallery-video"
                  />
                </LazyLoad>
                <div className="video-overlay">
                  <p className="video-timestamp">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                  {entry.mood && (
                    <div className="video-mood">
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
        <p className="no-content">No videos found.</p>
      )}
    </div>
  );
};

export default GalleryVideos;