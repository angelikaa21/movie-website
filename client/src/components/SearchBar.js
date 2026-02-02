import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { searchMulti } from '../api/tmdb';
import '../styles/Navbar.css';

const SearchBar = ({ setSearchResults }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const location = useLocation();

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            const results = await searchMulti(query);
            setSearchResults(results);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setShowResults(false);
        }
    };

    useEffect(() => {
        setSearchQuery('');
        setShowResults(false);
    }, [location]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="navbar-search" ref={searchRef}>
            <input
                type="text"
                placeholder="Search for movies or TV shows"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
                className="search-input"
            />
            {showResults && (
                <div className="search-dropdown">
                </div>
            )}
        </div>
    );
};

export default SearchBar;


