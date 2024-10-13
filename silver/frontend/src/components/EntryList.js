import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { format } from 'date-fns';

const EntryList = ({ entries, handleDelete }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleEdit = (entryId) => {
    // Navigate to the edit page with the entry ID
    navigate(`/edit/${entryId}`);
  };

  if (!entries || entries.length === 0) {
    return <p>No entries to display.</p>;
  }

  return (
    <div>
      {entries.map((entry) => (  // Use the entries prop directly
        <div key={entry.id}>
          <h3>{entry.title}</h3>
          <p>{entry.content}</p>
          {entry.image && <img src={`http://127.0.0.1:8000${entry.image}`} alt={entry.title} style={{ maxWidth: '200px' }} />}
          {entry.video && <video src={`http://127.0.0.1:8000${entry.video}`} controls style={{ maxWidth: '200px' }}>Your browser does not support video</video>}
          {entry.document && <a href={`http://127.0.0.1:8000${entry.document}`} download>Download Document</a>}
          <p>Created on: {format(new Date(entry.timestamp), 'MMMM do, yyyy, h:mm a')}</p>
          <button onClick={() => handleDelete(entry.id)}>Delete</button>
          <button onClick={() => handleEdit(entry.id)}>Edit</button>
        </div>
      ))}
    </div>
  );
};

export default EntryList;