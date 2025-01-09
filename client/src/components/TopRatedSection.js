import React, { useState, useEffect, useRef } from 'react';
import { fetchTopRatedMovies } from '../api/tmdb';
import { sliderSettings } from '../utils/sliderSettings'; // Import wspólnych ustawień slidera
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import '../styles/SliderSection.css'; // Wspólny plik CSS dla wszystkich sekcji

const TopRatedSection = () => {
    const [movies, setMovies] = useState([]);
    const [isDragging, setIsDragging] = useState(false);  // Stan do śledzenia przewijania
    const dragStartTime = useRef(null);  // Czas rozpoczęcia przewijania

    useEffect(() => {
        fetchTopRatedMovies()
            .then((results) => {
                setMovies(results);
            })
            .catch((err) => {
                console.error("Error fetching top rated movies:", err);
            });
    }, []);

    const sliderSettingsWithDrag = {
        ...sliderSettings, // Użycie wspólnych ustawień slidera
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
        
        // Jeśli przewijanie trwało mniej niż 150 ms, to uznajemy to za kliknięcie, nie przewijanie
        if (isDragging && dragDuration < 150) {
            e.preventDefault(); // Zablokowanie przejścia na stronę
        }
    };

    return (
        <section className="slider-section">
            <h2>Top Rated Movies</h2>
            <Slider {...sliderSettingsWithDrag}> {/* Użycie slidera z dodatkowymi ustawieniami */}
                {movies.map(movie => (
                    <div key={movie.id}>
                        <Link
                            to={`/movies/${movie.id}`} // Link do strony szczegółów
                            className="slider-card"
                            onClick={handleCardClick} // Obsługa kliknięcia
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="slider-image"
                            />
                            <h3>{movie.title}</h3>
                        </Link>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default TopRatedSection;
