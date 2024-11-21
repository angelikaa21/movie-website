import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrendingMovies } from '../api/tmdb';
import '../styles/TrendingSection.css';
import { FaFire } from "react-icons/fa";
import Slider from 'react-slick';

const TrendingSection = () => {
    const [movies, setMovies] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false); // Nowy stan
    const sliderRef = useRef(null);
    const dragStartTime = useRef(null); // Czas rozpoczęcia przeciągania

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
            dragStartTime.current = Date.now(); // Zapisanie czasu rozpoczęcia przeciągania
            setIsDragging(true);  // Ustawienie isDragging na true przed zmianą slajdu
            setCurrentSlide(next);  // Ustawienie nowego indeksu slajdu
        },
        afterChange: () => {
            setIsDragging(false);  // Resetowanie isDragging po zmianie slajdu
        },
    };

    // Obliczanie szerokości paska postępu
    const progressWidth = movies.length > 0
        ? `${((currentSlide + 1) / movies.length) * 100}%`
        : '0%';

    // Funkcja obsługująca kliknięcie karty filmu
    const handleCardClick = (e) => {
        const dragDuration = Date.now() - dragStartTime.current; // Czas przeciągania

        // Jeśli przeciąganie trwało krócej niż 150 ms, to traktujemy kliknięcie jako przypadkowe
        if (isDragging && dragDuration < 150) {
            e.preventDefault(); // Zapobiegamy kliknięciu, jeśli przeciąganie było zbyt krótkie
        }
    };

    return (
        <section className="trending-section">
            <h2><FaFire /> Trending Movies <FaFire /></h2>
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
                                onClick={handleCardClick}  // Zapobieganie kliknięciu, jeśli przeciągamy slider
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

            {/* Pasek postępu */}
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
