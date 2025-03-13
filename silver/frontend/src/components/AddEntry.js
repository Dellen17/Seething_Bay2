import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VoiceToText from './VoiceToText';
import VoiceNote from './VoiceNote';
import MoodSelector from './MoodSelector';
import LoadingSpinner from './LoadingSpinner'; // Import the spinner
import { FaFileUpload, FaMicrophone, FaKeyboard, FaSave } from 'react-icons/fa';
import '../styles/AddEntry.css';

const AddEntry = ({ onEntryAdded, entry, onUpdateEntry, setShowEditor }) => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [inputMethod, setInputMethod] = useState('text');
  const [error, setError] = useState('');
  const [mood, setMood] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submission

  useEffect(() => {
    if (entry) {
      setContent(entry.content || '');
      setSelectedFile(null);
      setFileType('');
      setMood(entry.mood || '');
      setAudioBlob(null);
      setError('');
    }
  }, [entry]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : 'document';
      setFileType(fileType);
    }
  };

  const handleAudioRecorded = (blob) => {
    if (blob && blob.size > 0) {
      setAudioBlob(blob);
      setError('');
    } else {
      setError('No audio recorded. Please try again.');
    }
    setIsRecording(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setAudioBlob(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Ensure mood is selected
    if (!mood) {
      setError('Please select a mood before submitting.');
      return;
    }

    setIsSubmitting(true); // Start loading
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    if (content) formData.append('content', content);
    formData.append('mood', mood); // Mood is now mandatory

    if (selectedFile) {
      if (fileType === 'image') {
        formData.append('image', selectedFile);
      } else if (fileType === 'video') {
        formData.append('video', selectedFile);
      } else {
        formData.append('document', selectedFile);
      }
    }

    if (audioBlob) {
      formData.append('voice_note', audioBlob, 'voice_note.webm');
    }

    try {
      let response;
      if (entry) {
        response = await axios.put(`http://127.0.0.1:8000/api/entries/${entry.id}/update/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        onUpdateEntry(response.data);
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/entries/create/', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        onEntryAdded(response.data);
      }

      // Reset form fields
      setContent('');
      setSelectedFile(null);
      setFileType('');
      setMood('');
      setAudioBlob(null);
      setError('');

      // Close the form after successful submission
      setShowEditor(false);
    } catch (err) {
      if (err.response) {
        setError(`Error: ${err.response.status} - ${err.response.data.detail || 'Failed to create or update entry. Please try again.'}`);
      } else if (err.request) {
        setError('No response received from the server. Please check your network connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  const isFormValid = content || selectedFile || audioBlob;

  return (
    <div className="add-entry-container">
      <h3 className="form-title">{entry ? 'Edit Entry' : 'Add New Entry'}</h3>
      {error && <p className="error-message">{error}</p>}
      <form className="add-entry-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Choose Input Method</label>
          <div className="input-method-selector">
            <button
              type="button"
              className={`input-method-button ${inputMethod === 'text' ? 'active' : ''}`}
              onClick={() => setInputMethod('text')}
            >
              <FaKeyboard className="input-method-icon" /> Text
            </button>
            <button
              type="button"
              className={`input-method-button ${inputMethod === 'voiceToText' ? 'active' : ''}`}
              onClick={() => setInputMethod('voiceToText')}
            >
              <FaMicrophone className="input-method-icon" /> Voice to Text
            </button>
            <button
              type="button"
              className={`input-method-button ${inputMethod === 'voiceNote' ? 'active' : ''}`}
              onClick={() => setInputMethod('voiceNote')}
            >
              <FaMicrophone className="input-method-icon" /> Voice Note
            </button>
          </div>
        </div>

        {inputMethod === 'text' && (
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}

        {inputMethod === 'voiceToText' && (
          <VoiceToText
            onTranscriptUpdate={setContent}
            onCancel={() => setInputMethod('text')}
          />
        )}

        {inputMethod === 'voiceNote' && (
          <VoiceNote
            onAudioRecorded={handleAudioRecorded}
            resetAudioPreview={audioBlob === null}
            onStartRecording={handleStartRecording}
            isRecording={isRecording}
          />
        )}

        <div className="form-group">
          <label className="form-label">
            <FaFileUpload className="form-icon" /> Upload File (Image, Video, or Document)
          </label>
          <input
            className="form-input"
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="file-preview">
            {fileType === 'image' && <img src={URL.createObjectURL(selectedFile)} alt="Preview" />}
            {fileType === 'video' && <video src={URL.createObjectURL(selectedFile)} controls />}
            {fileType === 'document' && (
              <a
                href={URL.createObjectURL(selectedFile)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Document
              </a>
            )}
          </div>
        )}

        <MoodSelector mood={mood} setMood={setMood} />

        <button className="form-submit" type="submit" disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? <LoadingSpinner /> : (entry ? 'Update Entry' : 'Add Entry')}
        </button>
      </form>
    </div>
  );
};

export default AddEntry;