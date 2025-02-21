import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VoiceToText from './VoiceToText';
import VoiceNote from './VoiceNote';
import MoodSelector from './MoodSelector';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setAudioBlob(null); // Reset audio blob on new recording start
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!content && !selectedFile && !audioBlob) {
      setError('Please add some content, a file, or a voice note before submitting.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (mood) formData.append('mood', mood);

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
      setIsSubmitting(false);
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
          <select
            className="form-select"
            value={inputMethod}
            onChange={(e) => setInputMethod(e.target.value)}
          >
            <option value="text">Text Entry</option>
            <option value="voiceToText">Voice to Text</option>
            <option value="voiceNote">Voice Note</option>
          </select>
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

        {inputMethod === 'voiceToText' && <VoiceToText />}
        {inputMethod === 'voiceNote' && (
          <VoiceNote
            onAudioRecorded={handleAudioRecorded}
            resetAudioPreview={audioBlob === null}
            onStartRecording={handleStartRecording}
            isRecording={isRecording}
          />
        )}

        <div className="form-group">
          <label className="form-label">Upload File (Image, Video, or Document)</label>
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
          {isSubmitting ? <span className="spinner"></span> : entry ? 'Update Entry' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
};

export default AddEntry;