import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/EditEntry.css';

const EditEntry = ({ entry, onUpdateEntry }) => {
  const [content, setContent] = useState(entry?.content || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(entry?.image || '');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [existingVideo, setExistingVideo] = useState(entry?.video || '');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [existingDocument, setExistingDocument] = useState(entry?.document || '');
  const [selectedVoiceNote, setSelectedVoiceNote] = useState(null);
  const [existingVoiceNote, setExistingVoiceNote] = useState(entry?.voice_note || '');
  const [mood, setMood] = useState(entry?.mood || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e, setFile, setExistingFile) => {
    const file = e.target.files[0];
    if (file && file.size < 5 * 1024 * 1024) {
      setFile(file);
      setExistingFile(null);
    } else {
      setError('File size exceeds 5MB limit.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('content', content);
    formData.append('mood', mood);
    if (selectedImage) formData.append('image', selectedImage);
    if (selectedVideo) formData.append('video', selectedVideo);
    if (selectedDocument) formData.append('document', selectedDocument);
    if (selectedVoiceNote) formData.append('voice_note', selectedVoiceNote);

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/entries/${entry.id}/update/`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        onUpdateEntry(response.data);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data.detail || 'Failed to update entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-entry-container">
      <h2 className="edit-entry-title">Edit Entry</h2>
      {error && <p className="edit-entry-error">{error}</p>}
      <form className="edit-entry-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            className="edit-entry-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mood">Mood</label>
          <select
            id="mood"
            className="edit-entry-select"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            <option value="">Select Mood</option>
            <option value="happy">Happy</option>
            <option value="neutral">Neutral</option>
            <option value="sad">Sad</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            className="edit-entry-file-input"
            onChange={(e) => handleFileChange(e, setSelectedImage, setExistingImage)}
          />
          {existingImage && !selectedImage && (
            <div className="existing-file-preview">
              <h4>Current Image:</h4>
              <img src={existingImage} alt="Current" className="edit-entry-image-preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="video">Upload Video</label>
          <input
            type="file"
            id="video"
            className="edit-entry-file-input"
            onChange={(e) => handleFileChange(e, setSelectedVideo, setExistingVideo)}
          />
          {existingVideo && !selectedVideo && (
            <div className="existing-file-preview">
              <h4>Current Video:</h4>
              <video src={existingVideo} controls className="edit-entry-video-preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="document">Upload Document</label>
          <input
            type="file"
            id="document"
            className="edit-entry-file-input"
            onChange={(e) => handleFileChange(e, setSelectedDocument, setExistingDocument)}
          />
          {existingDocument && !selectedDocument && (
            <div className="existing-file-preview">
              <h4>Current Document:</h4>
              <a href={existingDocument} download>Download Document</a>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="voiceNote">Upload Voice Note</label>
          <input
            type="file"
            id="voiceNote"
            accept="audio/*"
            className="edit-entry-file-input"
            onChange={(e) => handleFileChange(e, setSelectedVoiceNote, setExistingVoiceNote)}
          />
          {existingVoiceNote && !selectedVoiceNote && (
            <div className="existing-file-preview">
              <h4>Current Voice Note:</h4>
              <audio src={existingVoiceNote} controls className="edit-entry-audio-preview" />
            </div>
          )}
        </div>

        <div className="edit-entry-actions">
          <button type="submit" className="edit-entry-submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Entry'}
          </button>
          <button
            type="button"
            className="edit-entry-cancel"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEntry;