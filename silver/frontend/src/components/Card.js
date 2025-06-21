import React from 'react';
import '../styles/Card.css';

const Card = ({ title, description }) => {
  return (
    <div className="card-item">
      <h2 className="user-name">{title}</h2>
      <p className="user-profession">{description}</p>
      <button className="message-button">Learn More</button>
    </div>
  );
};

export default Card;