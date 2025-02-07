import React, { useEffect, useState } from 'react';
import '../styles/ProfilePage.css';
import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'e8017557aecacd6272fd3a1654fdf1f7';

const fetchMovieDetails = async (movieId) => {
  try {
    const [detailsResponse, creditsResponse, releaseResponse] = await Promise.all([
      axios.get(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`),
      axios.get(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`),
      axios.get(`${BASE_URL}/movie/${movieId}/release_dates?api_key=${API_KEY}`),
    ]);

    console.log('Movie details response:', detailsResponse.data);

    const director = creditsResponse.data.crew.find(member => member.job === 'Director');
    const certification = releaseResponse.data.results.find(country => country.iso_3166_1 === 'US')?.release_dates[0]?.certification || 'N/A';

    return {
      ...detailsResponse.data,
      director: director ? director.name : 'Unknown',
      certification
    };
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

const fetchSeriesDetails = async (seriesId) => {
  try {
    const [detailsResponse, creditsResponse] = await Promise.all([
      axios.get(`${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}&language=en-US`),
      axios.get(`${BASE_URL}/tv/${seriesId}/credits?api_key=${API_KEY}`),
    ]);

    console.log('Series details response:', detailsResponse.data);

    const creator = creditsResponse.data.crew.find(member => member.job === 'Creator');

    return {
      ...detailsResponse.data,
      creator: creator ? creator.name : 'Unknown',
    };
  } catch (error) {
    console.error("Error fetching series details:", error);
    return null;
  }
};

const fetchDetails = async (id) => {
  const movieDetails = await fetchMovieDetails(id);
  if (movieDetails) {
    return { ...movieDetails, type: 'movie' };
  }

  const seriesDetails = await fetchSeriesDetails(id);
  if (seriesDetails) {
    return { ...seriesDetails, type: 'series' };
  }

  return null;
};

const ProfilePage = () => {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [ratedItems, setRatedItems] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [userName, setUserName] = useState('');

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user profile');

        const userData = await response.json();
        setUserName(userData.name);
      } catch (err) {
        console.error('Error fetching user data:', err.message);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const fetchCount = async (endpoint) => {
        try {
          const response = await fetch(`http://localhost:5000/api/user/${endpoint}/count`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            console.error(`${endpoint} count fetch failed with status:`, response.status);
            throw new Error(`Failed to fetch ${endpoint} count`);
          }
          const { count } = await response.json();
          return count;
        } catch (err) {
          console.error(`Error fetching ${endpoint} count:`, err.message);
          return 0;
        }
      };

      setFavoritesCount(await fetchCount('favorites'));
      setWatchlistCount(await fetchCount('watchlist'));
      setRatingsCount(await fetchCount('ratings'));
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('access_token');
      if (!token || activeSection !== 'favorites') return;

      try {
        const response = await fetch('http://localhost:5000/api/user/favorites', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch favorites');
        const favoriteIds = await response.json();

        console.log('Favorites from API:', favoriteIds);

        const favoritesWithDetails = await Promise.all(favoriteIds.map(async (id) => {
          const details = await fetchDetails(id);
          return details ? { ...details, id } : null;
        }));

        console.log('Favorites with details:', favoritesWithDetails);

        setFavorites(favoritesWithDetails.filter(item => item && item.poster_path));
      } catch (err) {
        console.error('Error fetching favorites:', err.message);
      }
    };

    fetchFavorites();
  }, [activeSection]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      const token = localStorage.getItem('access_token');
      if (!token || activeSection !== 'watchlist') return;

      try {
        const response = await fetch('http://localhost:5000/api/user/watchlist', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch watchlist');
        const watchlistIds = await response.json();

        const watchlistWithDetails = await Promise.all(watchlistIds.map(async (id) => {
          const details = await fetchDetails(id);
          return details ? { ...details, id } : null;
        }));

        setWatchlist(watchlistWithDetails.filter(item => item && item.poster_path));
      } catch (err) {
        console.error('Error fetching watchlist:', err.message);
      }
    };

    fetchWatchlist();
  }, [activeSection]);

  useEffect(() => {
    const fetchRatedItems = async () => {
      const token = localStorage.getItem('access_token');
      if (!token || activeSection !== 'ratings') return;
  
      try {
        const response = await fetch('http://localhost:5000/api/user/ratings/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) throw new Error('Failed to fetch rated items');
        const ratedItems = await response.json();
  
        console.log('Rated items from API:', ratedItems);
        const ratedItemsWithDetails = await Promise.all(ratedItems.map(async ({ id, rating }) => {
          const details = await fetchDetails(id);
          return details ? { ...details, id, rating } : null;
        }));
  
        console.log('Rated items with details:', ratedItemsWithDetails);
  
        setRatedItems(ratedItemsWithDetails.filter(item => item && item.poster_path));
      } catch (err) {
        console.error('Error fetching rated items:', err.message);
      }
    };
  
    fetchRatedItems();
  }, [activeSection]);

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-info">
            <h2 className="username">Hello, {userName}!</h2>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-item clickable" onClick={() => handleSectionClick('ratings')}>
            <h3>{ratingsCount}</h3>
            <p>Your Ratings</p>
          </div>
          <div className="stat-item clickable" onClick={() => handleSectionClick('watchlist')}>
            <h3>{watchlistCount}</h3>
            <p>Watchlist</p>
          </div>
          <div className="stat-item clickable" onClick={() => handleSectionClick('favorites')}>
            <h3>{favoritesCount}</h3>
            <p>Favorites</p>
          </div>
        </div>

        {activeSection === 'favorites' && (
          <div className="favorites-container">
            <h2>Favorites</h2>
            <div className="favorites-list">
              {favorites.map(item => (
                <div key={item.id} className="favorite-item">
                  <img
                    src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                    alt={item.title || item.name}
                  />
                  <h3>{item.title || item.name}</h3>
                  <p>{item.type === 'movie' ? 'Movie' : 'Series'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'watchlist' && (
          <div className="watchlist-container">
            <h2>Watchlist</h2>
            <div className="watchlist-list">
              {watchlist.map(item => (
                <div key={item.id} className="watchlist-item">
                  <img
                    src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                    alt={item.title || item.name}
                  />
                  <h3>{item.title || item.name}</h3>
                  <p>{item.type === 'movie' ? 'Movie' : 'Series'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'ratings' && (
          <div className="ratings-container">
            <h2>Rated Items</h2>
            <div className="ratings-list">
              {ratedItems.length > 0 ? (
                ratedItems.map(item => (
                  <div key={item.id} className="rated-item">
                    <img
                      src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                      alt={item.title || item.name}
                    />
                    <h3>{item.title || item.name}</h3>
                    <p>Rating: {item.rating}</p>
                    <p>{item.type === 'movie' ? 'Movie' : 'Series'}</p>
                  </div>
                ))
              ) : (
                <p>No rated items available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;