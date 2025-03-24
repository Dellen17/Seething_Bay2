import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import '../styles/VoiceToText.css';

const VoiceToText = ({ onTranscriptUpdate, onCancel }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [cleanedTranscript, setCleanedTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    // Handle speech recognition results
    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
      }
      setTranscript((prevTranscript) => prevTranscript + currentTranscript);
    };

    // Handle errors
    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      setError('An error occurred with speech recognition. Please try again.');
    };

    // Cleanup on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start/stop listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setCleanedTranscript('');
      recognitionRef.current.start();
    }
    setIsListening((prev) => !prev);
  };

  // Send raw transcript to backend for AI cleanup
  const handleCleanupTranscript = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cleanup-transcript/`,
        { raw_text: transcript },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      setCleanedTranscript(response.data.cleaned_text);
    } catch (error) {
      setError('Failed to clean up transcript. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing the transcript
  const handleEdit = () => {
    setIsEditing(true);
    setEditedTranscript(cleanedTranscript || transcript);
  };

  // Save the edited transcript
  const handleSaveEdit = () => {
    setTranscript(editedTranscript);
    setCleanedTranscript('');
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Pass the transcript to the parent component when the user is done
  const handleDone = () => {
    onTranscriptUpdate((cleanedTranscript || transcript).trim());
  };

  // Cancel the transcription
  const handleCancel = () => {
    setTranscript('');
    setCleanedTranscript('');
    onCancel();
  };

  return (
    <div className="voice-to-text">
      <button
        onClick={toggleListening}
        style={{ backgroundColor: isListening ? 'red' : 'green', color: 'white' }}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>

      {isEditing ? (
        <div className="edit-transcript-container">
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="edit-transcript-textarea"
          />
          <div className="edit-buttons">
            <button onClick={handleSaveEdit} className="save-edit-button">
              Save
            </button>
            <button onClick={handleCancelEdit} className="cancel-edit-button">
              Cancel Edit
            </button>
          </div>
        </div>
      ) : (
        <div className="transcript-container">
          <p>{transcript || 'Start speaking and your words will appear here...'}</p>
          {cleanedTranscript && (
            <div className="cleaned-transcript">
              <h4>Cleaned-Up Transcript:</h4>
              <p>{cleanedTranscript}</p>
            </div>
          )}
          {isLoading && <LoadingSpinner />}
          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {!isListening && transcript && !isEditing && (
        <div className="action-buttons">
          <button onClick={handleCleanupTranscript} className="cleanup-button" disabled={isLoading}>
            {isLoading ? 'Cleaning Up...' : 'Clean Up Transcript'}
          </button>
          <button onClick={handleEdit} className="edit-button">
            Edit Transcript
          </button>
          <button onClick={handleDone} className="done-button">
            Use This Transcript
          </button>
          <button onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceToText;