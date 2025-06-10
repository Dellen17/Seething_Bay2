import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <h1 className="welcome-logo">Seething Bay</h1>
      <p className="welcome-tagline">Reflect, Track, Grow with Seething Bay</p>
      <div className="welcome-features">
        <ul>
          <li>Diary Entries: Write and organize with text, images, and more.</li>
          <li>Mood Tracking: Visualize trends with interactive charts.</li>
          <li>Sentiment Analysis: Gain insights with AI-powered analysis.</li>
        </ul>
      </div>
      <div className="welcome-buttons">
        <Link to="/login">
          <button className="register-button">Log In</button>
        </Link>
        <Link to="/register">
          <button className="register-button">Register</button>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;