import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import '../styles/GalleryVideos.css';

const GalleryVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchAllVideos = async () => {
    const token = localStorage.getItem('access_token');
    let allEntries = [];
    let nextPage = 'http://127.0.0.1:8000/api/entries/';

    try {
      while (nextPage) {
        const response = await axios.get(nextPage, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allEntries = [...allEntries, ...response.data.results.entries];
        nextPage = response.data.next; // Get the URL for the next page
      }

      const entriesWithVideos = allEntries.filter((entry) => entry.video);
      setVideos(entriesWithVideos);
    } catch (err) {
      setError('Failed to fetch videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVideos();
  }, []);

  if (loading) return <p className="loading-message">Loading videos...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="gallery-videos-container">
      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate('/gallery')} // Navigate back to the Gallery page
      >
        ← Back to Gallery
      </button>

      <h2>Videos</h2>
      <div className="videos-grid">
        {videos.length > 0 ? (
          videos.map((entry) => (
            <div key={entry.id} className="video-item">
              <video
                src={`http://127.0.0.1:8000${entry.video}`}
                controls
                className="gallery-video"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ))
        ) : (
          <p>No videos found.</p>
        )}
      </div>
    </div>
  );
};

export default GalleryVideos;