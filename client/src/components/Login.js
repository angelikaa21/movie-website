import React, { useState } from 'react';
import '../styles/Navbar.css';
import { loginUser } from '../api/auth'; // Import funkcji do logowania
import { showSuccess, showError } from '../utils/notification'; // Import funkcji z notification.js

const Login = ({ isOpen, onClose, openRegisterModal }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Resetowanie błędu przed nową próbą
        try {
            const response = await loginUser({ login: username, password });
            localStorage.setItem('token', response.token); // Zapis tokena w Local Storage

            // Użycie funkcji z notification.js do pokazania powiadomienia o sukcesie
            showSuccess('Zalogowano pomyślnie!'); 
            onClose(); // Zamknięcie modala po zalogowaniu
        } catch (err) {
            setError(err || 'Wystąpił błąd logowania.');
            // Użycie funkcji z notification.js do pokazania powiadomienia o błędzie
            showError('Błąd logowania. Spróbuj ponownie.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay login-modal-overlay" onClick={onClose}>
            <div className="modal login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Welcome Back!</h2>
                <p>Log in to your account to continue.</p>
                <form onSubmit={handleLogin}>
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="modal-button">Login</button>
                </form>
                <p>
                    Don't have an account?
                    <span onClick={openRegisterModal} className="modal-link"> Register here</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
