import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaImage, FaVideo, FaFile, FaMicrophone } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import '../styles/EditEntry.css';

const EditEntry = ({ entry, onUpdateEntry, onCancel }) => {
  const [content, setContent] = useState(entry?.content || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(entry?.image_url || ''); // Updated to use image_url
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [existingVideo, setExistingVideo] = useState(entry?.video || '');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [existingDocument, setExistingDocument] = useState(entry?.document || '');
  const [selectedVoiceNote, setSelectedVoiceNote] = useState(null);
  const [existingVoiceNote, setExistingVoiceNote] = useState(entry?.voice_note || '');
  const [mood, setMood] = useState(entry?.mood || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (isSubmitting) return;

    if (!mood) {
      setError('Please select a mood before submitting.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('content', content);
    formData.append('mood', mood);

    if (selectedImage) formData.append('image', selectedImage);
    if (selectedVideo) formData.append('video', selectedVideo);
    if (selectedDocument) formData.append('document', selectedDocument);
    if (selectedVoiceNote) formData.append('voice_note', selectedVoiceNote, 'voice_note.webm');

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/entries/${entry.id}/update/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpdateEntry({ ...response.data, image: response.data.image_url }); // Updated to use image_url
      navigate('/');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error response:', err.response);
      if (err.response) {
        setError(`Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setError('No response received from the server. Please check your network connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-entry-container">
      <h2>Edit Entry</h2>
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
            <option value="excited">Excited</option>
            <option value="tired">Tired</option>
            <option value="angry">Angry</option>
            <option value="stressed">Stressed</option>
            <option value="shocked">Shocked</option>
            <option value="calm">Calm</option>
            <option value="confused">Confused</option>
            <option value="loved">Loved</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">
            <FaImage className="form-icon" /> Upload Image
          </label>
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
          <label htmlFor="video">
            <FaVideo className="form-icon" /> Upload Video
          </label>
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
          <label htmlFor="document">
            <FaFile className="form-icon" /> Upload Document
          </label>
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
          <label htmlFor="voiceNote">
            <FaMicrophone className="form-icon" /> Upload Voice Note
          </label>
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
              <audio src={existingVoiceNote} controls className="edit-entry-audio-preview" type="audio/mpeg" />
            </div>
          )}
        </div>

        <div className="edit-entry-actions">
          <button type="submit" className="edit-entry-submit" disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner /> : (
              <>
                <FaSave className="button-icon" />
                <span>Update Entry</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="edit-entry-cancel"
            onClick={() => {
              onCancel();
              navigate('/');
              window.scrollTo(0, 0);
            }}
          >
            <FaTimes className="button-icon" />
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEntry;