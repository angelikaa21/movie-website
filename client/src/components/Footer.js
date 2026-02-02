import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <Link to="/" className="footer-logo-link">MOVIEMOTIONS</Link>
                </div>
              
            </div>
            <div className="footer-bottom">
                <p>&copy; MOVIEMOTIONS.</p>
            </div>
        </footer>
    );
}

export default Footer;