import React, { useState, useEffect } from 'react';
import { fetchUpcomingMovies } from '../api/tmdb';
import Slider from 'react-slick';
import '../styles/UpcomingSection.css';

const UpcomingSection = () => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        fetchUpcomingMovies()
            .then((results) => {
                setMovies(results);
            })
            .catch((err) => {
                console.error("Error fetching upcoming movies:", err);
            });
    }, []);

    const sliderSettings = {
        infinite: true,
        speed: 500,
        slidesToShow: 8,
        slidesToScroll: 3,
        arrows: true,
        dots: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },
        ],
    };

    return (
        <section className="upcoming-section">
            <h2>Upcoming Movies</h2>
            <Slider {...sliderSettings}>
                {movies.map(movie => (
                    <div key={movie.id}>
                        <div className="upcoming-movie-card">
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="upcoming-movie-image"
                            />
                            <h3>{movie.title}</h3>
                        </div>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default UpcomingSection;
