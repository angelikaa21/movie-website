import React, { useState } from 'react';
import '../styles/Navbar.css';
import { registerUser } from '../api/auth';
import { showSuccess, showError } from '../utils/notification';

const Register = ({ isOpen, onClose, openLoginModal }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== repeatPassword) {
            setError('Passwords must match.');
            showError('Passwords must match.');
            return;
        }

        try {
            await registerUser({ name: username, login: username, email, password });
            showSuccess('Registered successfully!');
            onClose();
            openLoginModal();
        } catch (err) {
            setError(err?.message || 'A registration error has occurred.');
            showError('A registration error has occurred. Please try again.');
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
