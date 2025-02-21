import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import '../styles/GalleryVoiceNotes.css';

const GalleryVoiceNotes = () => {
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchAllVoiceNotes = async () => {
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

      const entriesWithVoiceNotes = allEntries.filter((entry) => entry.voice_note);
      setVoiceNotes(entriesWithVoiceNotes);
    } catch (err) {
      setError('Failed to fetch voice notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVoiceNotes();
  }, []);

  if (loading) return <p className="loading-message">Loading voice notes...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="gallery-voice-notes-container">
      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate('/gallery')} // Navigate back to the Gallery page
      >
        ← Back to Gallery
      </button>

      <h2>Voice Notes</h2>
      <div className="voice-notes-grid">
        {voiceNotes.length > 0 ? (
          voiceNotes.map((entry) => (
            <div key={entry.id} className="voice-note-item">
              <audio
                src={`http://127.0.0.1:8000${entry.voice_note}`}
                controls
                className="gallery-voice-note"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          ))
        ) : (
          <p>No voice notes found.</p>
        )}
      </div>
    </div>
  );
};

export default GalleryVoiceNotes;