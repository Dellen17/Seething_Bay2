import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import '../styles/GalleryImages.css';

const GalleryImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchAllImages = async () => {
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

      const entriesWithImages = allEntries.filter((entry) => entry.image);
      setImages(entriesWithImages);
    } catch (err) {
      setError('Failed to fetch images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllImages();
  }, []);

  if (loading) return <p className="loading-message">Loading images...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="gallery-images-container">
      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate('/gallery')} // Navigate back to the Gallery page
      >
        ← Back to Gallery
      </button>

      <h2>Images</h2>
      <div className="images-grid">
        {images.length > 0 ? (
          images.map((entry) => (
            <div key={entry.id} className="image-item">
              <img
                src={`http://127.0.0.1:8000${entry.image}`}
                alt={`Entry ${entry.id}`}
                className="gallery-image"
              />
            </div>
          ))
        ) : (
          <p>No images found.</p>
        )}
      </div>
    </div>
  );
};

export default GalleryImages;