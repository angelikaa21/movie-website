import React, { useState, useEffect, useRef } from 'react';
import { fetchUpcomingMovies } from '../api/tmdb';
import Slider from 'react-slick';
import { sliderSettings } from '../utils/sliderSettings';
import { Link } from 'react-router-dom';
import '../styles/SliderSection.css';

const UpcomingSection = () => {
    const [movies, setMovies] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartTime = useRef(null);

    useEffect(() => {
        fetchUpcomingMovies()
            .then((results) => {
                setMovies(results);
            })
            .catch((err) => {
                console.error("Error fetching upcoming movies:", err);
            });
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

    return (
        <section className="slider-section upcoming">
            <h2>Upcoming Movies</h2>
            <Slider {...sliderSettingsWithDrag}>
                {movies.map(movie => (
                    <div key={movie.id}>
                        <Link
                            to={`/movies/${movie.id}`}
                            className="slider-card upcoming-card"
                            onClick={handleCardClick}
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="slider-image upcoming-image"
                            />
                            <h3>{movie.title}</h3>
                        </Link>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default UpcomingSection;
