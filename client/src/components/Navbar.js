import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import Login from './Login';
import Register from './Register';
import '../styles/Navbar.css';
import { showSuccess, showError } from '../utils/notification';

const Navbar = ({ setSearchResults, searchResults }) => {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const dispatch = useDispatch();

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

    const handleLogout = () => {
        dispatch(logout());
        showSuccess('Logged out successfully!');
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
                        <Link to="/movies" onClick={handleMenuItemClick}>
                            Movies
                        </Link>
                        <Link to="/tv-series" onClick={handleMenuItemClick}>
                            TV Series
                        </Link>
                        <Link to="/what-to-watch" onClick={handleMenuItemClick}>
                            What to Watch - AI Quiz
                        </Link>
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
                    <button className="login-button" onClick={openLoginModal}>
                        Login
                    </button>
                )}
            </div>

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
