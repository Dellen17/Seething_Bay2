import React from 'react';
import { format } from 'date-fns';
import { FaSmile, FaFrown, FaMeh } from 'react-icons/fa';
import '../styles/EntryList.css';

const EntryList = ({ entries, handleDelete, handleEdit }) => {
  const renderMoodIcon = (mood) => {
    switch (mood) {
      case 'happy':
        return <FaSmile className="mood-icon happy" />;
      case 'neutral':
        return <FaMeh className="mood-icon neutral" />;
      case 'sad':
        return <FaFrown className="mood-icon sad" />;
      default:
        return null;
    }
  };

  if (!entries || entries.length === 0) {
    return <p>No entries to display.</p>;
  }

  return (
    <div className="entry-list">
      {entries.map((entry) => (
        <div key={entry.id} className="entry-item">
          <div className="entry-content" dangerouslySetInnerHTML={{ __html: entry.content }} />

          <div className="entry-mood">
            {renderMoodIcon(entry.mood)}
          </div>

          {entry.image && (
            <img
              src={`http://127.0.0.1:8000${entry.image}`}
              alt="Uploaded Visual"
              className="entry-image"
            />
          )}
          {entry.video && (
            <video
              src={`http://127.0.0.1:8000${entry.video}`}
              controls
              className="entry-video"
            >
              Your browser does not support video
            </video>
          )}
          {entry.document && (
            <a href={`http://127.0.0.1:8000${entry.document}`} download className="entry-document">
              Download Document
            </a>
          )}
          {entry.voice_note && (
            <audio
              src={`http://127.0.0.1:8000${entry.voice_note}`}
              controls
              className="entry-audio"
            >
              Your browser does not support audio
            </audio>
          )}
          <p className="entry-timestamp">
            Created on: {format(new Date(entry.timestamp), 'MMMM do, yyyy, h:mm a')}
          </p>
          <button onClick={() => handleDelete(entry.id)} className="entry-button delete">
            Delete
          </button>
          <button onClick={() => handleEdit(entry)} className="entry-button edit">
            Edit
          </button>
        </div>
      ))}
    </div>
  );
};

export default EntryList;