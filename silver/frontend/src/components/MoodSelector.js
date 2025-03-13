import React from 'react';
import {
  FaSmile,       // Happy
  FaFrown,       // Sad
  FaMeh,         // Neutral
  FaGrinBeam,    // Excited
  FaTired,       // Tired
  FaAngry,       // Angry
  FaFlushed,     // Stressed
  FaSurprise,    // Shocked
  FaSmileBeam,   // Calm
  FaQuestionCircle, // Confused
  FaHeart,       // Loved
} from 'react-icons/fa';

// Export the moods array as the single source of truth
export const moods = [
  { icon: FaSmile, label: 'happy', color: 'green' },
  { icon: FaMeh, label: 'neutral', color: 'gray' },
  { icon: FaFrown, label: 'sad', color: 'blue' },
  { icon: FaGrinBeam, label: 'excited', color: 'orange' },
  { icon: FaTired, label: 'tired', color: 'red' },
  { icon: FaAngry, label: 'angry', color: 'darkred' },
  { icon: FaFlushed, label: 'stressed', color: 'darkorange' },
  { icon: FaSurprise, label: 'shocked', color: 'gold' },
  { icon: FaSmileBeam, label: 'calm', color: 'lightblue' },
  { icon: FaQuestionCircle, label: 'confused', color: 'purple' },
  { icon: FaHeart, label: 'loved', color: 'pink' },
];

const MoodSelector = ({ mood, setMood }) => {
  return (
    <div className="mood-selector">
      <h4>Select Your Mood</h4>
      <div className="mood-icons">
        {moods.map(({ icon: Icon, label, color }) => (
          <Icon
            key={label}
            size="20px"
            color={mood === label ? color : 'gray'}
            onClick={() => setMood(label)}
            title={label.charAt(0).toUpperCase() + label.slice(1)} // Tooltip on hover
            className="mood-icon"
          />
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;