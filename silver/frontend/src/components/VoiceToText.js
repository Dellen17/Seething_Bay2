import React, { useState, useEffect, useRef } from 'react';
import '../styles/VoiceToText.css';

const VoiceToText = ({ onTranscriptUpdate, onCancel }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State for editing mode
  const [editedTranscript, setEditedTranscript] = useState(''); // State for edited transcript
  const recognitionRef = useRef(null); // Use a ref to store the recognition object

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
  }, []); // No dependencies needed

  // Start/stop listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript(''); // Reset transcript when starting a new session
      recognitionRef.current.start();
    }
    setIsListening((prev) => !prev);
  };

  // Handle editing the transcript
  const handleEdit = () => {
    setIsEditing(true);
    setEditedTranscript(transcript); // Initialize the edited transcript with the current transcript
  };

  // Save the edited transcript
  const handleSaveEdit = () => {
    setTranscript(editedTranscript); // Update the transcript with the edited version
    setIsEditing(false); // Exit editing mode
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false); // Exit editing mode without saving
  };

  // Pass the transcript to the parent component when the user is done
  const handleDone = () => {
    onTranscriptUpdate(transcript.trim()); // Trim any trailing spaces
  };

  // Cancel the transcription
  const handleCancel = () => {
    setTranscript(''); // Reset the transcript
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
        </div>
      )}

      {!isListening && transcript && !isEditing && (
        <div className="action-buttons">
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