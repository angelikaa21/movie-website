import React, { useState, useRef } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { sliderSettings } from '../utils/sliderSettings';
import '../styles/SliderSection.css';

const Similar = ({ similar, isTVShow }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef(null);

  const filteredSimilar = similar.filter(item => item.poster_path);

  const sliderSettingsWithDrag = {
    ...sliderSettings,
    beforeChange: () => {
      dragStartTime.current = Date.now();
      setIsDragging(true);
    },
    afterChange: () => {
      setIsDragging(false);
    },
  };

  const handleCardClick = (e) => {
    const dragDuration = Date.now() - dragStartTime.current;
    if (isDragging && dragDuration < 150) {
      e.preventDefault();
    }
  };

  if (!filteredSimilar || filteredSimilar.length === 0) {
    return <div className="no-similar-message">No similar movies or TV shows found.</div>;
  }

  return (
    <section className="slider-section-similar">
      <h2>Similar</h2>
      <Slider {...sliderSettingsWithDrag}>
        {filteredSimilar.map(item => (
          <div key={item.id}>
            <Link
              to={isTVShow ? `/tv-series/${item.id}` : `/movies/${item.id}`}
              className="slider-card"
              onClick={handleCardClick}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                className="slider-image"
              />
              <h3>{item.title || item.name}</h3>
            </Link>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default Similar;
