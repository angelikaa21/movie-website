import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import Login from './Login';
import Register from './Register';
import '../styles/Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const menuRef = useRef(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const openLoginModal = () => {
        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false);
    };

    const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
        setIsLoginModalOpen(false);
    };

    const closeModals = () => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
    };

    const handleOutsideClick = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
            setIsMenuOpen(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const handleMenuItemClick = () => setIsMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo">
                    <span className="logo-movie">MOVIE</span>
                    <span className="logo-motions">MOTIONS</span>
                </Link>
                <div className="hamburger-menu" onClick={toggleMenu}>
                    <div className="hamburger-bars">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                    <span className="menu-text">Menu</span>
                </div>
                {isMenuOpen && (
                    <div ref={menuRef} className="dropdown-menu">
                        <Link to="/movies" onClick={handleMenuItemClick}>Movies</Link>
                        <Link to="/tv-series" onClick={handleMenuItemClick}>TV Series</Link>
                        <Link to="/what-to-watch" onClick={handleMenuItemClick}>What to Watch</Link>
                    </div>
                )}
            </div>
            <SearchBar setSearchResults={setSearchResults} />
            {searchResults.length > 0 && <SearchResults results={searchResults} />}
            <button className="login-button" onClick={openLoginModal}>Login</button>

            <Login
                isOpen={isLoginModalOpen}
                onClose={closeModals}
                openRegisterModal={openRegisterModal}
            />
            <Register
                isOpen={isRegisterModalOpen}
                onClose={closeModals}
                openLoginModal={openLoginModal}
            />
        </nav>
    );
};

export default Navbar;
