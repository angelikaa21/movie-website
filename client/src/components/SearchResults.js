import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const SearchResults = ({ results, handleResultClick }) => {
    const handleResultClickInternal = () => {
        handleResultClick();
    };

    return (
        <div className="search-dropdown">
            {results.map((result) => {
                const isMovie = result.media_type === 'movie';
                const isTVShow = result.media_type === 'tv';
                const linkTo = isMovie
                    ? `/movies/${result.id}`
                    : isTVShow
                    ? `/tv-series/${result.id}`
                    : '#';

                return (
                    <Link
                        to={linkTo}
                        key={result.id}
                        className="search-result-item"
                        onClick={handleResultClickInternal}
                    >
                        {result.poster_path && (
                            <img
                                src={`https://image.tmdb.org/t/p/w200${result.poster_path}`}
                                alt={result.title || result.name}
                                className="search-result-image"
                            />
                        )}
                        <span>{result.title || result.name}</span>
                    </Link>
                );
            })}
        </div>
    );
};

export default SearchResults;



