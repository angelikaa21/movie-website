import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BsPlayBtnFill } from 'react-icons/bs';
import { FaRegHeart, FaHeart, FaRegBookmark, FaBookmark, FaStar, FaRegStar } from 'react-icons/fa';
import { fetchMovieDetails, fetchMovieTrailer, fetchCast, fetchTVShowDetails, fetchTVShowTrailer, fetchTVCast, fetchSimilar } from '../api/tmdb';
import Cast from '../components/Cast';
import Similar from '../components/Similar';
import '../styles/MovieDetails.css';

const MovieDetailsPage = ({ isTVShow }) => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isToWatch, setIsToWatch] = useState(false);
    const [trailer, setTrailer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [cast, setCast] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [userRating, setUserRating] = useState(null);
    const [showRateModal, setShowRateModal] = useState(false);
    const [stars, setStars] = useState(0);

    const handleFavoriteClick = () => setIsFavorite(!isFavorite);
    const handleToWatchClick = () => setIsToWatch(!isToWatch);
    const toggleRateModal = () => setShowRateModal(!showRateModal);

    const handleStarClick = (starIndex) => setStars(starIndex);
    const handleRateConfirm = () => {
        setUserRating(stars);
        toggleRateModal();
    };

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

    const genres = data.genres?.length ? data.genres.map(genre => genre.name).join(', ') : 'No genres available';
    const rating = data.vote_average ? `${data.vote_average.toFixed(1)} ★` : 'No rating available';
    const overview = data.overview || 'No overview available.';

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
                        <div className="rating-section">
                            <div className="tmdb-rating">
                                <span className="rating-label">TMDB Rating</span>
                                <strong><FaStar className="icon tmdb-icon" />{data.vote_average?.toFixed(1) || 'N/A'}/10</strong>
                                <span>{data.vote_count?.toLocaleString()} votes</span>
                            </div>

                            <div className="user-rating">
                                <span className="rating-label">Your Rating</span>
                                <button className="user-rate-btn" onClick={toggleRateModal}>
                                    {userRating ? (
                                        <>
                                            <FaStar className="icon user-rated-icon" />
                                            <span>{userRating}/10</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaRegStar className="icon" />
                                            <span>Rate</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <h2 className="movie-title">{isTVShow ? data.name : data.title}</h2>
                        <div className="movie-subtitle">{genres}</div>
                        <div className="movie-subtitle">{releaseYear}</div>
                        <div className="movie-subtitle">{runtime}</div>
                        <p className="movie-overview">{overview}</p>

                        <div className="movie-actions">
                            {trailer && (
                                <button onClick={toggleModal} className="watch-trailer-btn">
                                    <BsPlayBtnFill className="icon" />
                                    <span>Watch Trailer</span>
                                </button>
                            )}
                            <button onClick={handleFavoriteClick} className="like-btn">
                                {isFavorite ? <FaHeart className="icon" /> : <FaRegHeart className="icon" />}
                                <span>{isFavorite ? 'Remove' : 'Like'}</span>
                            </button>

                            <button onClick={handleToWatchClick} className="watch-btn">
                                {isToWatch ? <FaBookmark className="icon" /> : <FaRegBookmark className="icon" />}
                                <span>{isToWatch ? 'Remove from Watch list' : 'Add to Watch list'}</span>
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

            {showRateModal && (
                <div className="rate-modal-overlay" onClick={toggleRateModal}>
                    <div className="rate-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>What's your rating?</h3>
                        <div className="star-rating">
                            {[...Array(10)].map((_, index) => (
                                <FaStar
                                    key={index}
                                    className={`star ${index < stars ? 'selected' : ''}`}
                                    onClick={() => handleStarClick(index + 1)}
                                />
                            ))}
                        </div>
                        <button className="confirm-rate-btn" onClick={handleRateConfirm}>
                            Confirm
                        </button>
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
