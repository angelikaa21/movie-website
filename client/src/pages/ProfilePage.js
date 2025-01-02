import React, { useEffect, useState } from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [watchlistCount, setWatchlistCount] = useState(0);
    const [ratingsCount, setRatingsCount] = useState(0);

    useEffect(() => {
        const fetchFavoritesCount = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const response = await fetch(`http://localhost:5000/api/user/favorites/count`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch favorites count');

                const { count } = await response.json();
                setFavoritesCount(count);
            } catch (err) {
                console.error('Error fetching favorites count:', err.message);
            }
        };

        const fetchWatchlistCount = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const response = await fetch(`http://localhost:5000/api/user/watchlist/count`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch watchlist count');

                const { count } = await response.json();
                setWatchlistCount(count);
            } catch (err) {
                console.error('Error fetching watchlist count:', err.message);
            }
        };

        const fetchRatingsCount = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
          
            try {
              const response = await fetch(`http://localhost:5000/api/user/ratings/count`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
          
              if (!response.ok) throw new Error('Failed to fetch ratings count');
          
              const { ratingsCount } = await response.json();
              setRatingsCount(ratingsCount);
            } catch (error) {
              console.error('Error fetching ratings count:', error.message);
            }
          };

        fetchFavoritesCount();
        fetchWatchlistCount();
        fetchRatingsCount();

    }, []);

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
                        <h3>{ratingsCount}</h3>
                        <p>Your Ratings</p>
                    </div>
                    <div className="stat-item">
                        <h3>{watchlistCount}</h3>
                        <p>Watchlist</p>
                    </div>
                    <div className="stat-item">
                        <h3>{favoritesCount}</h3>
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
