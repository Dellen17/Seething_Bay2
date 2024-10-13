import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddEntry = ({ onEntryAdded, entry, onEntryUpdated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(''); // Track the type of the selected file
  const [error, setError] = useState('');

  // Effect to populate fields if editing an existing entry
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setSelectedFile(null); // Reset selected file
      setFileType(''); // Reset file type
    }
  }, [entry]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    // Check the type of file uploaded and set the fileType accordingly
    if (file) {
      const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';
      setFileType(fileType);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (selectedFile) {
      // Append the file with a dynamic field name based on file type
      formData.append(fileType, selectedFile);
    }

    try {
      let response;
      if (entry) {
        // If editing, make a PUT request to update the entry
        response = await axios.put(`http://127.0.0.1:8000/api/entries/${entry.id}/update/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        onEntryUpdated(response.data); // Notify parent that the entry is updated
      } else {
        // If creating a new entry
        response = await axios.post('http://127.0.0.1:8000/api/entries/create/', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        onEntryAdded(response.data); // Notify parent that entry is added
      }

      // Reset form after submission
      setTitle('');
      setContent('');
      setSelectedFile(null);
      setFileType(''); // Reset file type after successful upload
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to create or update entry. Please try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <h3>{entry ? 'Edit Entry' : 'Add New Entry'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Upload File (Image, Video, or Document)</label>
          <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt" onChange={handleFileChange} />
        </div>
        <button type="submit">{entry ? 'Update Entry' : 'Add Entry'}</button>
      </form>
    </div>
  );
};

export default AddEntry;