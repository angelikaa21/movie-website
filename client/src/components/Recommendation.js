import React, { useEffect, useState, useRef } from 'react';
import { fetchRecommendations } from '../api/user';
import Slider from 'react-slick';
import { sliderSettings } from '../utils/sliderSettings';
import { Link } from 'react-router-dom';
import '../styles/SliderSection.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef(null);
  const isFetchedRef = useRef(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('User is not logged in');
        setLoading(false);
        return;
      }

      if (isFetchedRef.current) return;

      try {
        const data = await fetchRecommendations(token);
        if (data.recommendations.length === 0) {
          console.log("Brak rekomendacji, spróbujmy ponownie!");
        }
        setRecommendations(data.recommendations);
        setReason(data.reason);
        isFetchedRef.current = true;
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const sliderSettingsWithDrag = {
    ...sliderSettings,
    beforeChange: (current, next) => {
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

  if (loading) return <div>Loading recommendations...</div>;

  if (recommendations.length === 0) return <div></div>;

  return (
    <section className="slider-section recommendations">
      <h2>Because you like: {reason}</h2>
      <Slider {...sliderSettingsWithDrag}>
        {recommendations.map(item => (
          <div key={item.id}>
            <Link 
              to={item.media_type === 'movie' ? `/movies/${item.id}` : `/tv-series/${item.id}`}
              className="slider-card recommendation-card"
              onClick={handleCardClick}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                className="slider-image recommendation-image"
              />
              <h3>{item.title || item.name}</h3>
            </Link>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default Recommendations;
