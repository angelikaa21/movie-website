import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MovieCard.css';

function MovieCard({ movie, type }) {
  return (
    <Link to={`/${type}/${movie.id}`} className="movie-card">
      <img
        src={`https://image.tmdb.org/t/p/w1280${movie.poster_path}`}
        alt={movie.title || movie.name}
        className="movie-card-image"
      />
      <h3>{movie.title || movie.name}</h3>
    </Link>
  );
}

export default MovieCard;
