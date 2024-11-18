import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faFrown, faMeh, faGrinBeam, faTired } from '@fortawesome/free-solid-svg-icons';

const MoodSelector = ({ mood, setMood }) => {
  const moods = [
    { icon: faSmile, label: 'happy', color: 'green' },
    { icon: faMeh, label: 'neutral', color: 'blue' },
    { icon: faFrown, label: 'sad', color: 'purple' },
    { icon: faGrinBeam, label: 'excited', color: 'orange' },
    { icon: faTired, label: 'tired', color: 'red' },
  ];

  return (
    <div>
      <h4>Select Your Mood</h4>
      <div style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}>
        {moods.map(({ icon, label, color }) => (
          <FontAwesomeIcon
            key={label}
            icon={icon}
            size="2x"
            color={mood === label ? color : 'gray'}
            onClick={() => setMood(label)}
            title={label.charAt(0).toUpperCase() + label.slice(1)} // Adds tooltip on hover
          />
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;