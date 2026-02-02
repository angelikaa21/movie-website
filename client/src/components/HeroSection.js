import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTrendingMovies } from '../api/tmdb';
import { MdKeyboardArrowRight } from "react-icons/md";
import '../styles/HeroSection.css';
import Slider from 'react-slick';

const HeroSection = () => {
    const [movies, setMovies] = useState([]);
    const navigate = useNavigate();
    const sliderRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [totalSlides, setTotalSlides] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    const progressBarRef = useRef(null);

    useEffect(() => {
        fetchTrendingMovies()
            .then((results) => {
                setMovies(results);
                setTotalSlides(results.length);
            })
            .catch((err) => {
                console.error("Error fetching trending movies:", err);
            });
    }, []);

    useEffect(() => {
        if (progressBarRef.current) {
            setContainerWidth(progressBarRef.current.offsetWidth);
        }
    }, [movies]);

    const sliderHeroSettings = {
        infinite: true,
        speed: 1000,
        autoplay: true,
        autoplaySpeed: 8000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        dots: false,
        beforeChange: (current, next) => {
            setCurrentSlide(next);
        },
    };

    const handleShowDetails = (movie) => {
        const path = movie.media_type === 'tv' ? `/tv-series/${movie.id}` : `/movies/${movie.id}`;
        navigate(path);
    };

    const slideWidth = totalSlides > 1 ? (containerWidth - 200) / (totalSlides - 1) : 0;
    const progressPosition = slideWidth * currentSlide;

    return (
        <section className="hero-section">
            <Slider {...sliderHeroSettings} ref={sliderRef}>
                {movies.map((movie) => (
                    <div key={movie.id} className="hero-slide">
                        <div
                            className="hero-slide-background"
                            style={{
                                backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                            }}
                        >
                            <div className="hero-content">
                                <h1>{movie.title || movie.name}</h1>
                                <div className="movie-details">
                                    <span className="movie-runtime">
                                        {movie.runtime ? `${movie.runtime} min` : ''}
                                    </span>
                                    <span className="movie-genre">
                                        {movie.genres?.map((genre) => genre.name).join(', ')}
                                    </span>
                                </div>
                                <p>{movie.overview}</p>
                            </div>

                            <div className="hero-buttons">
                                <button onClick={() => handleShowDetails(movie)}>
                                     DETAILS
                                    <MdKeyboardArrowRight className="arrow-icon" />
                                </button>
                            </div>

                            <div className="hero-progress-bar-container" ref={progressBarRef}>
                                <div
                                    className="hero-progress-bar"
                                    style={{
                                        transform: `translateX(${progressPosition}px)`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            <div className="slider-buttons">
                <button onClick={() => sliderRef.current.slickPrev()}>{"<"}</button>
                <button onClick={() => sliderRef.current.slickNext()}>{">"}</button>
            </div>
        </section>
    );
};

export default HeroSection;
