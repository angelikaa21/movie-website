import React, { useState } from 'react';
import '../styles/Navbar.css';
import { loginUser } from '../api/auth';
import { showSuccess, showError } from '../utils/notification';

const Login = ({ isOpen, onClose, openRegisterModal, setIsLoggedIn }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await loginUser({ 
                login: formData.username, 
                password: formData.password 
            });
            localStorage.setItem('token', response.token);
            setIsLoggedIn(true);
            showSuccess('Zalogowano pomyślnie!');
            onClose();
        } catch (err) {
            setError(err.message || 'Wystąpił błąd logowania.');
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
                        name="username"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
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
