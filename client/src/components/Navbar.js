import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import Login from './Login';
import Register from './Register';
import '../styles/Navbar.css';

const Navbar = ({ setIsLoggedIn, isLoggedIn, setSearchResults, searchResults }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const handleMenuItemClick = () => setIsMenuOpen(false);

    const handleLogin = () => {
        openLoginModal();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        toast.success('Wylogowano pomyślnie!');
    };

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
            <div className="auth-buttons">
                {isLoggedIn ? (
                    <>
                        <Link to="/profile">
                            <button className="profile-button">Profile</button>
                        </Link>
                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        className="login-button"
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                )}
            </div>

            <Login
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                openRegisterModal={() => {
                    setIsLoginModalOpen(false);
                    setIsRegisterModalOpen(true);
                }}
                setIsLoggedIn={setIsLoggedIn}
            />
            <Register
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                openLoginModal={() => {
                    setIsRegisterModalOpen(false);
                    setIsLoginModalOpen(true);
                }}
            />
        </nav>
    );
};

export default Navbar;
