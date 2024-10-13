import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditEntry = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // New state for image
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success message
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();
  const { id } = useParams(); // Get the entry ID from URL params

  useEffect(() => {
    const fetchEntry = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/entries/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTitle(response.data.title);
        setContent(response.data.content);
        // Set the selectedFile if the entry has an existing image
        if (response.data.image) {
          setSelectedFile(response.data.image); // Store the existing image URL or file
        }
      } catch (err) {
        setError('Failed to load entry');
        console.error(err);
      }
    };

    fetchEntry();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      const validTypes = ['image/']; // Add other valid types as needed
      if (validTypes.some(type => file.type.startsWith(type))) {
        setSelectedFile(file); // Set the selected file if it's valid
      } else {
        setError('Invalid file type. Please upload an image.'); // Set error for invalid file type
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    setLoading(true); // Set loading state
    setError(''); // Reset error message
    setSuccessMessage(''); // Reset success message

    const formData = new FormData(); // Create a FormData object
    formData.append('title', title);
    formData.append('content', content);
    if (selectedFile) {
      formData.append('image', selectedFile); // Append the image file
    }

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/entries/${id}/update/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Set content type for form data
        },
      });
      if (response.status === 200) {
        setSuccessMessage('Entry updated successfully!'); // Set success message
        navigate('/dashboard'); // Redirect to dashboard after successful edit
      }
    } catch (err) {
      if (err.response) {
        setError(`Failed to update entry: ${err.response.data.detail || err.response.data.non_field_errors.join(', ')}`);
      } else {
        setError('Failed to update entry. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div>
      <h2>Edit Entry</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>} {/* Show success message */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            onChange={handleFileChange} // Handle file selection
          />
        </div>
        {/* Display the existing image if available */}
        {selectedFile && typeof selectedFile === 'string' && (
          <div>
            <h4>Current Image:</h4>
            <img src={selectedFile} alt="Current" style={{ width: '100px', height: 'auto' }} />
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Entry'}
        </button>
      </form>
    </div>
  );
};

export default EditEntry;