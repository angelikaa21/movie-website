import React, { useState } from 'react';
import '../styles/Navbar.css';
import { registerUser } from '../api/auth'; // Import funkcji do rejestracji
import { showSuccess, showError } from '../utils/notification'; // Import funkcji do powiadomień

const Register = ({ isOpen, onClose, openLoginModal }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); // Resetowanie błędu przed nową próbą

        // Sprawdzenie, czy hasła są takie same
        if (password !== repeatPassword) {
            setError('Hasła muszą się zgadzać.');
            showError('Hasła muszą się zgadzać.'); // Wyświetlanie komunikatu o błędzie
            return;
        }

        try {
            // Wywołanie funkcji rejestracji
            await registerUser({ name: username, login: username, email, password });
            
            // Powiadomienie o sukcesie
            showSuccess('Zarejestrowano pomyślnie!');
            onClose(); // Zamknięcie modala po udanej rejestracji
        } catch (err) {
            // Obsługa błędów
            setError(err || 'Wystąpił błąd rejestracji.');
            showError('Wystąpił błąd rejestracji. Spróbuj ponownie.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay register-modal-overlay" onClick={onClose}>
            <div className="modal register-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Create an Account</h2>
                <p>Join us and explore amazing movies!</p>
                <form onSubmit={handleRegister}>
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <label>Repeat Password</label>
                    <input
                        type="password"
                        placeholder="Repeat password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="modal-button">Register</button>
                </form>
                <p>
                    Already have an account?
                    <span onClick={openLoginModal} className="modal-link"> Login here</span>
                </p>
            </div>
        </div>
    );
};

export default Register;
