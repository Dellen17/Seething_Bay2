import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarView.css';

const CalendarView = () => {
    const [date, setDate] = useState(new Date());
    const [entries, setEntries] = useState([]);
    const [selectedDayEntries, setSelectedDayEntries] = useState([]);

    useEffect(() => {
        fetchEntriesForMonth(date);
    }, [date]);

    const fetchEntriesForMonth = async (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/entries/month/${year}/${month}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEntries(response.data);
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };

    const onChange = (newDate) => {
        setDate(newDate);
    };

    const onDayClick = (value) => {
        const dayEntries = entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return (
                entryDate.getDate() === value.getDate() &&
                entryDate.getMonth() === value.getMonth() &&
                entryDate.getFullYear() === value.getFullYear()
            );
        });
        setSelectedDayEntries(dayEntries);
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

    return (
        <div className="calendar-view">
            <h2>Calendar View</h2>
            <p>Select a month to view your entries.</p>

            <Calendar
                onChange={onChange}
                onClickDay={onDayClick}
                value={date}
                tileContent={tileContent}
            />

            <div className="selected-day-entries">
                <h3>Entries for {date.toDateString()}</h3>
                {selectedDayEntries.length > 0 ? (
                    selectedDayEntries.map(entry => (
                        <div key={entry.id} className="entry-preview">
                            <div className="entry-header">
                                <span className="entry-timestamp">
                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                                {entry.mood && (
                                    <span className="entry-mood">
                                        Mood: {entry.mood}
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
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                )}
                                {entry.document && (
                                    <div className="media-thumbnail">
                                        <a
                                            href={`http://127.0.0.1:8000${entry.document}`}
                                            download
                                            className="entry-document"
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
                                        >
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No entries for this day.</p>
                )}
            </div>
        </div>
    );
};

export default CalendarView;