import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MovieDetails.css';

const Similar = ({ similar, isTVShow }) => {
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft -= 200;
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += 200;
        }
    };

    const filteredSimilar = similar.filter(item => item.poster_path);

    if (!filteredSimilar || filteredSimilar.length === 0) {
        return <div className="no-similar-message">No similar movies or TV shows found.</div>;
    }

    return (
        <div className="movie-cast-container">
            <h3 className="cast-title">Similar Movies/TV Shows</h3>
            <div className="movie-cast-wrapper">
                <button className="scroll-button left" onClick={scrollLeft}>{'<'}</button>
                <div className="movie-cast" ref={scrollContainerRef}>
                    {filteredSimilar.map((item) => (
                        <div key={item.id} className="cast-member">
                            <Link to={isTVShow ? `/tv-series/${item.id}` : `/movies/${item.id}`}>
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                    alt={item.title || item.name}
                                    className="cast-photo"
                                />
                            </Link>
                            <p className="actor-name">{item.title || item.name}</p>
                        </div>
                    ))}
                </div>
                <button className="scroll-button right" onClick={scrollRight}>{'>'}</button>
            </div>
        </div>
    );
};

export default Similar;
