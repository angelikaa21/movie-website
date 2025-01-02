import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import placeholder from '../images/placeholder.jpg';
import '../styles/Cast.css';

const Cast = ({ cast }) => {
  const castContainerRef = useRef(null);

  const handleScrollLeft = () => {
    if (castContainerRef.current) {
      castContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth',
      });
    }
  };

  const handleScrollRight = () => {
    if (castContainerRef.current) {
      castContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="movie-cast-container">
      <h3 className="cast-title">Cast</h3>
      <div className="movie-cast-wrapper">
        <button className="scroll-button left" onClick={handleScrollLeft}>←</button>
        <div className="movie-cast" ref={castContainerRef}>
          {cast.length > 0 ? (
            cast.map((actor) => (
              <div 
                key={actor.id} 
                className={`cast-member ${!actor.profile_path ? 'no-photo' : ''}`}
              >
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w1280${actor.profile_path}`}
                    alt={actor.name}
                    className="cast-photo"
                  />
                ) : (
                    <img
                     src={placeholder}
                     alt="placeholder"
                     className="cast-photo"
                     />
                )}

                <p className="actor-name">{actor.name}</p>
                <p className="actor-role">{actor.character}</p>
              </div>
            ))
          ) : (
            <p>No cast available.</p>
          )}
        </div>
        <button className="scroll-button right" onClick={handleScrollRight}>→</button>
      </div>
    </div>
  );
};

Cast.propTypes = {
  cast: PropTypes.array.isRequired,
};

export default Cast;
