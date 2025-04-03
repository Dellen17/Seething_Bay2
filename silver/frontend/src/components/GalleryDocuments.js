import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFilePdf, FaFileWord, FaFileAlt, FaDownload } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import { moods } from './MoodSelector';
import '../styles/GalleryDocuments.css';

const GalleryDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getFileIcon = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    switch(extension) {
      case 'pdf':
        return <FaFilePdf className="document-icon pdf" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="document-icon word" />;
      default:
        return <FaFileAlt className="document-icon text" />;
    }
  };

  const fetchAllDocuments = useCallback(async () => {
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
      const entriesWithDocuments = allEntries.filter((entry) => entry.document);
      setDocuments(entriesWithDocuments);
    } catch (err) {
      setError('Failed to fetch documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDocuments();
  }, [fetchAllDocuments]);

  const handleRetry = () => {
    fetchAllDocuments();
  };

  const handleDocumentClick = (entryId) => {
    navigate(`/edit/${entryId}`);
  };

  return (
    <div className="gallery-documents-container">
      <button className="back-button" onClick={() => navigate('/gallery')}>
        ← Back to Gallery
      </button>

      <h2>Documents</h2>
      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
          <p className="loading-message">Loading documents...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : documents.length > 0 ? (
        <div className="documents-grid">
          {documents.map((entry) => {
            const moodData = moods.find((m) => m.label === entry.mood);
            const MoodIcon = moodData?.icon;
            const filename = entry.document.split('/').pop();
            
            return (
              <div
                key={entry.id}
                className="document-item"
                onClick={() => handleDocumentClick(entry.id)}
              >
                <div className="document-preview">
                  {getFileIcon(entry.document)}
                  <span className="document-filename">{filename}</span>
                </div>
                <div className="document-overlay">
                  <p className="document-timestamp">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                  {entry.mood && (
                    <div className="document-mood">
                      {MoodIcon && (
                        <MoodIcon size="20px" color={moodData?.color} />
                      )}
                      <span>{entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</span>
                    </div>
                  )}
                  <a 
                    href={entry.document} 
                    download 
                    className="download-button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaDownload />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="no-content">No documents found.</p>
      )}
    </div>
  );
};

export default GalleryDocuments;