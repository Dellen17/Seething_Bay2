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
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error state
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = true; // Keep listening until stopped
    recognitionRef.current.interimResults = false; // Only use final results
    recognitionRef.current.lang = 'en-US'; // Set language

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
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    // Cleanup on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop(); // Stop recognition when the component unmounts
      }
    };
  }, []);

  // Start/stop listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript(''); // Reset transcript when starting a new session
      setCleanedTranscript(''); // Reset cleaned transcript
      recognitionRef.current.start();
    }
    setIsListening((prev) => !prev);
  };

  // Send raw transcript to backend for AI cleanup
  const handleCleanupTranscript = async () => {
    if (!transcript.trim()) return; // Don't send empty transcript

    setIsLoading(true);
    setError(''); // Clear any previous errors
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/cleanup-transcript/',
        { raw_text: transcript },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      setCleanedTranscript(response.data.cleaned_text); // Set cleaned-up transcript
    } catch (error) {
      console.error('Error cleaning up transcript:', error);
      setError('Failed to clean up transcript. Please try again.'); // User-friendly error message
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing the transcript
  const handleEdit = () => {
    setIsEditing(true);
    setEditedTranscript(cleanedTranscript || transcript); // Initialize the edited transcript
  };

  // Save the edited transcript
  const handleSaveEdit = () => {
    setTranscript(editedTranscript);
    setCleanedTranscript(''); // Reset cleaned transcript after editing
    setIsEditing(false); // Exit editing mode
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false); // Exit editing mode without saving
  };

  // Pass the transcript to the parent component when the user is done
  const handleDone = () => {
    onTranscriptUpdate((cleanedTranscript || transcript).trim()); // Use cleaned transcript if available
  };

  // Cancel the transcription
  const handleCancel = () => {
    setTranscript(''); // Reset the transcript
    setCleanedTranscript(''); // Reset cleaned transcript
    onCancel(); // Notify the parent component
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