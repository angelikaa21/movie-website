import React from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <span>U</span>
                    </div>
                    <div className="profile-info">
                        <h2 className="username">Username</h2>
                        <p>This is your profile</p>
                    </div>
                </div>

                <div className="stats-container">
                    <div className="stat-item">
                        <h3>0</h3>
                        <p>Your Ratings</p>
                    </div>
                    <div className="stat-item">
                        <h3>0</h3>
                        <p>Watchlist</p>
                    </div>
                    <div className="stat-item">
                        <h3>0</h3>
                        <p>Favourites</p>
                    </div>
                </div>

                <div className="recently-rated">
                    <h2>Recently Rated</h2>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;