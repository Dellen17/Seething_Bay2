import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { moods } from './MoodSelector'; // Import moods array
import '../styles/CalendarView.css';

const CalendarView = () => {
  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [selectedDayEntries, setSelectedDayEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchEntriesForMonth = useCallback(async (selectedDate) => {
    setLoading(true);
    setError('');
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const token = localStorage.getItem('access_token');

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/entries/month/${year}/${month}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setError('Failed to load entries. Please try again.');
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEntriesForMonth(date);
  }, [date, fetchEntriesForMonth]);

  // Update selectedDayEntries whenever entries or date changes
  useEffect(() => {
    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });
    setSelectedDayEntries(dayEntries);
  }, [entries, date]);

  const onChange = (newDate) => {
    setDate(newDate);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.timestamp);
        return (
          entryDate.getDate() === date.getDate() &&
          entryDate.getMonth() === date.getMonth() &&
          entryDate.getFullYear() === date.getFullYear()
        );
      });
      return hasEntry ? <div className="entry-indicator">•</div> : null;
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const today = new Date();
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        return 'today';
      }
    }
    return null;
  };

  const handleEntryClick = (entryId) => {
    navigate(`/edit/${entryId}`);
  };

  return (
    <div className="calendar-view">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Dashboard
      </button>

      <h2>Calendar View</h2>
      <p>Select a month to view your entries.</p>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading entries...</p>
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <Calendar
            onChange={onChange}
            value={date}
            tileContent={tileContent}
            tileClassName={tileClassName}
          />

          <div className="selected-day-entries">
            <h3>Entries for {date.toDateString()}</h3>
            {selectedDayEntries.length > 0 ? (
              selectedDayEntries.map(entry => {
                const moodData = moods.find(m => m.label === entry.mood);
                const MoodIcon = moodData?.icon;
                return (
                  <div
                    key={entry.id}
                    className="entry-preview"
                    onClick={() => handleEntryClick(entry.id)}
                  >
                    <div className="entry-header">
                      <span className="entry-timestamp">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      {entry.mood && (
                        <span className="entry-mood">
                          {MoodIcon && <MoodIcon size="20px" color={moodData?.color} />}
                          {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                        </span>
                      )}
                    </div>
                    {entry.content && <p>{entry.content}</p>}
                    <div className="entry-media-grid">
                      {entry.image && (
                        <div className="media-thumbnail">
                          <img
                            src={`http://127.0.0.1:8000${entry.image}`}
                            alt="Entry"
                            className="entry-image"
                          />
                        </div>
                      )}
                      {entry.video && (
                        <div className="media-thumbnail">
                          <video
                            src={`http://127.0.0.1:8000${entry.video}`}
                            controls
                            className="entry-video"
                          />
                        </div>
                      )}
                      {entry.document && (
                        <div className="media-thumbnail">
                          <a
                            href={`http://127.0.0.1:8000${entry.document}`}
                            download
                            className="entry-document"
                            onClick={(e) => e.stopPropagation()}
                          >
                            📄 Download Document
                          </a>
                        </div>
                      )}
                      {entry.voice_note && (
                        <div className="media-thumbnail">
                          <audio
                            src={`http://127.0.0.1:8000${entry.voice_note}`}
                            controls
                            className="entry-audio"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No entries for this day.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarView;