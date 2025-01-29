import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrendingMovies } from '../api/tmdb';
import '../styles/TrendingSection.css';
import { FaFire } from "react-icons/fa";
import Slider from 'react-slick';

const TrendingSection = () => {
    const [movies, setMovies] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);
    const dragStartTime = useRef(null);

    useEffect(() => {
        fetchTrendingMovies()
            .then((results) => {
                setMovies(results);
            })
            .catch((err) => {
                console.error("Error fetching trending movies:", err);
            });
    }, []);

    const trendingSliderSettings = {
        infinite: true,
        speed: 500,
        slidesToShow: 4,
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
        beforeChange: (current, next) => {
            dragStartTime.current = Date.now();
            setIsDragging(true);
            setCurrentSlide(next);
        },
        afterChange: () => {
            setIsDragging(false);
        },
    };

    const progressWidth = movies.length > 0
        ? `${((currentSlide + 1) / movies.length) * 100}%`
        : '0%';

    const handleCardClick = (e) => {
        const dragDuration = Date.now() - dragStartTime.current;

        if (isDragging && dragDuration < 150) {
            e.preventDefault();
        }
    };

    return (
        <section className="trending-section">
            <h2>Trending this week</h2>
            <Slider {...trendingSliderSettings} ref={sliderRef}>
                {movies.map(movie => {
                    const linkTo = movie.media_type === 'movie'
                        ? `/movies/${movie.id}`
                        : `/tv-series/${movie.id}`;

                    return (
                        <div key={movie.id}>
                            <Link
                                to={linkTo}
                                className="trending-movie-card"
                                onClick={handleCardClick}
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                                    alt={movie.title || movie.name}
                                    className="trending-movie-image"
                                />
                                <h3>{movie.title || movie.name}</h3>
                            </Link>
                        </div>
                    );
                })}
            </Slider>
            
            <div className="trending-progress-bar-container">
                <div
                    className="trending-progress-bar"
                    style={{ width: progressWidth }}
                ></div>
            </div>
        </section>
    );
};

export default TrendingSection;
