import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import { moods } from './MoodSelector';
import '../styles/GalleryVoiceNotes.css';

const GalleryVoiceNotes = () => {
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAllVoiceNotes = useCallback(async () => {
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
      const entriesWithVoiceNotes = allEntries.filter((entry) => entry.voice_note_url);
      setVoiceNotes(entriesWithVoiceNotes);
    } catch (err) {
      setError(`Failed to fetch voice notes. Please try again. Details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllVoiceNotes();
  }, [fetchAllVoiceNotes]);

  const handleRetry = () => {
    fetchAllVoiceNotes();
  };

  const handleVoiceNoteClick = (entryId) => {
    navigate(`/edit/${entryId}`);
  };

  return (
    <div className="gallery-voice-notes-container">
      <button className="back-button" onClick={() => navigate('/gallery')}>
        ← Back to Gallery
      </button>

      <h2>Voice Notes</h2>
      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
          <p className="loading-message">Loading voice notes...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : voiceNotes.length > 0 ? (
        <div className="voice-notes-grid">
          {voiceNotes.map((entry) => {
            const moodData = moods.find((m) => m.label === entry.mood);
            const MoodIcon = moodData?.icon;
            return (
              <div
                key={entry.id}
                className="voice-note-item"
                onClick={() => handleVoiceNoteClick(entry.id)}
              >
                {entry.voice_note_url && (
                  <audio
                    src={entry.voice_note_url}
                    controls
                    className="gallery-voice-note"
                  >
                    Your browser does not support audio.
                  </audio>
                )}
                <div className="voice-note-overlay">
                  <p className="voice-note-timestamp">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                  {entry.mood && (
                    <div className="voice-note-mood">
                      {MoodIcon && (
                        <MoodIcon size={20} color={moodData?.color} />
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
        <p className="no-content">No voice notes found.</p>
      )}
    </div>
  );
};

export default GalleryVoiceNotes;