import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Card from './Card';
import '../styles/Welcome.css';

const Welcome = () => {
  const features = [
    { title: 'Diary Entries', description: 'Write and organize with text, images, and more.' },
    { title: 'Mood Tracking', description: 'Visualize your mood trends with interactive charts.' },
    { title: 'Sentiment Analysis', description: 'Gain insights with AI-powered analysis.' },
    { title: 'Entry Summaries', description: 'Automatically generate summaries with AI.' },
    { title: 'Secure and Private', description: 'Your data is encrypted and stored securely.' },
  ];

  return (
    <div className="welcome-container">
      <h1 className="welcome-logo">Seething Bay</h1>
      <p className="welcome-tagline">Reflect, Track, Grow with Seething Bay</p>
      <div className="welcome-slider">
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation
          modules={[Pagination, Navigation]}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          grabCursor={true}
          loop={true}
        >
          {features.map((feature, index) => (
            <SwiperSlide key={index}>
              <Card title={feature.title} description={feature.description} />
            </SwiperSlide>
          ))}
        </Swiper>
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