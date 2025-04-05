import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/About.css';

const About = () => {
  const navigate = useNavigate();
   
  return (
    <div className="about-container">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ← Back
      </button>  
      <h1>About Seething Bay</h1>
      <p>
        Welcome to <strong>Seething Bay</strong>, your personal diary and mood tracking app designed to help you
        reflect on your thoughts, emotions, and experiences in a secure and intuitive way.
      </p>

      <h2>What is Seething Bay?</h2>
      <p>
        Seething Bay is a web-based application that allows you to create, update, and delete diary entries.
        You can include text, images, videos, documents, and voice notes in your entries, making it a versatile
        tool for capturing your daily life.
      </p>

      <h2>Key Features</h2>
      <ul>
        <li>
          <strong>Diary Entries:</strong> Write and organize your thoughts with support for text, images, videos,
          documents, and voice notes.
        </li>
        <li>
          <strong>Mood Tracking:</strong> Track your mood for each entry and visualize trends over time using
          interactive charts.
        </li>
        <li>
          <strong>Sentiment Analysis:</strong> Get insights into the sentiment of your entries with AI-powered
          analysis.
        </li>
        <li>
          <strong>Entry Summarization:</strong> Automatically generate summaries of your diary entries using
          advanced AI.
        </li>
        <li>
          <strong>Secure and Private:</strong> Your data is encrypted and stored securely, ensuring your privacy.
        </li>
      </ul>

      <h2>How to Use Seething Bay</h2>
      <p>
        To get started, simply create an account and start adding diary entries. You can track your mood, analyze
        your sentiments, and explore your entries through the calendar and gallery views. Use the mood tracker to
        visualize your emotional trends and gain insights into your well-being.
      </p>

      <h2>Our Mission</h2>
      <p>
        The aim is to provide a safe and intuitive space for self-reflection and emotional
        well-being. I believe that journaling can be a powerful tool for personal growth, ii am here to
        make it easier and more meaningful for you.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions, feedback, or suggestions, feel free to reach out to me at{' '}
        <a href="mailto:gabrieldellen22@gmail.com">gabrieldellen22@gmail.com</a>. I'd love to hear from you!
      </p>
    </div>
  );
};

export default About;