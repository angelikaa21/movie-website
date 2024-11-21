import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails, fetchMovieTrailer, fetchCast, fetchTVShowDetails, fetchTVShowTrailer, fetchTVCast, fetchSimilar } from '../api/tmdb';
import Cast from '../components/Cast';
import Similar from '../components/Similar';
import '../styles/MovieDetails.css';

const MovieDetailsPage = ({ isTVShow }) => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [trailer, setTrailer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [cast, setCast] = useState([]);
    const [similar, setSimilar] = useState([]);

    useEffect(() => {
        const getDetails = async () => {
            try {
                const fetchedData = isTVShow ? await fetchTVShowDetails(id) : await fetchMovieDetails(id);
                setData(fetchedData);

                const fetchedTrailer = isTVShow ? await fetchTVShowTrailer(id) : await fetchMovieTrailer(id);
                setTrailer(fetchedTrailer);

                const fetchedCast = isTVShow ? await fetchTVCast(id) : await fetchCast(id);
                setCast(fetchedCast);

                const fetchedSimilar = await fetchSimilar(id, isTVShow);
                setSimilar(fetchedSimilar);
            } catch (err) {
                setError(err.message || "Error fetching details.");
                console.error("Error fetching details:", err);
            }
        };

        getDetails();
        window.scrollTo(0, 0);
    }, [id, isTVShow]);

    const toggleModal = () => setShowModal(!showModal);

    if (error) return <div className="error-message">{`Error: ${error}`}</div>;
    if (!data) return <div className="loading-message">Loading details...</div>;

    const backdropUrl = data.backdrop_path 
        ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` 
        : '/placeholder-backdrop.jpg';
    const posterUrl = data.poster_path 
        ? `https://image.tmdb.org/t/p/w1280${data.poster_path}` 
        : '/placeholder-poster.jpg';
    const releaseYear = data.release_date || data.first_air_date 
        ? (isTVShow ? data.first_air_date : data.release_date).split('-')[0] 
        : 'Unknown';
    const runtime = isTVShow 
        ? `${data.number_of_seasons || 0} season(s)` 
        : `${data.runtime || 0} min`;

    const director = data.director !== 'Unknown' ? data.director : null;

    return (
        <div className="movie-details-container">
            <div className="movie-banner-container">
                <div className="movie-banner" style={{ backgroundImage: `url(${backdropUrl})` }}></div>
                <div className="movie-content">
                    <img 
                        src={posterUrl} 
                        alt={isTVShow ? data.name : data.title} 
                        className="movie-cover" 
                    />
                    <div className="movie-info">
    <h2 className="movie-title">{isTVShow ? data.name : data.title}</h2>
    <div className="movie-subtitle">{data.genres.map(genre => genre.name).join(', ') || 'No genres available'}</div>
    <div className="movie-subtitle">{releaseYear}</div>
    <div className="movie-subtitle">{runtime}</div>
    <p className="movie-subtitle">
        <strong>TMDB Rating:</strong> {data.vote_average} ★
    </p>
    <p className="movie-overview">{data.overview || 'No overview available.'}</p>
    {data.director && (
        <p className="movie-subtitle">
            <strong>Director:</strong> {data.director}
        </p>
    )}

    <div className="movie-actions">
        {trailer && (
            <button onClick={toggleModal} className="watch-trailer-btn">
                Watch Trailer
            </button>
        )}
        <button className="like-btn">
            Favorite
        </button>
        <button className="watched-btn">
            Watched
        </button>
    </div>
</div>
                </div>
            </div>
    
            {showModal && trailer && (
    <div className="trailer-modal-overlay" onClick={toggleModal}>
        <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close-btn" onClick={toggleModal}>X</button>
            <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    </div>
)}
    
            <div className="cast-section">
                <Cast cast={cast} />
            </div>
    
            <div className="similar-section">
                <Similar similar={similar} />
            </div>
        </div>
    );
};

export default MovieDetailsPage;
