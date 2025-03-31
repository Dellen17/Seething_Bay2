import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { moods } from './MoodSelector';
import '../styles/EntryList.css';

const EntryList = ({ entries, handleDelete, handleEdit }) => {
  if (!entries || entries.length === 0) {
    return <p>No entries to display.</p>;
  }

  return (
    <div className="entry-list">
      {entries.map((entry) => {
        const moodData = moods.find(m => m.label === entry.mood);
        const MoodIcon = moodData?.icon;
        const moodColor = moodData?.color || 'gray';
        return (
          <div key={entry.id} className="entry-item">
            <div className="entry-content" dangerouslySetInnerHTML={{ __html: entry.content }} />

            {entry.mood && (
              <div className="entry-mood">
                {MoodIcon && <MoodIcon size={20} color={moodColor} className="mood-icon" />}
                <span>{entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</span>
              </div>
            )}

            {entry.image && (
              <img
                src={entry.image}  // Removed process.env.REACT_APP_API_URL
                alt="Uploaded Visual"
                className="entry-image"
              />
            )}
            {entry.video && (
              <video
                src={entry.video}
                controls
                className="entry-video"
              >
                { /* Your browser does not support video */ }
              </video>
            )}
            {entry.document && (
              <a href={entry.document} download className="entry-document">
                Download Document
              </a>
            )}
            {entry.voice_note && (
              <audio
                src={entry.voice_note}
                controls
                className="entry-audio"
              >
                {/* Your browser does not support audio */}
              </audio>
            )}
            <p className="entry-timestamp">
              Created on: {new Date(entry.timestamp).toLocaleString()}
            </p>
            <div className="entry-buttons">
              <button onClick={() => handleDelete(entry.id)} className="entry-button delete">
                <FaTrash className="button-icon" /> Delete
              </button>
              <button onClick={() => handleEdit(entry)} className="entry-button edit">
                <FaEdit className="button-icon" /> Edit
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EntryList;