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
  
      const director = creditsResponse.data.crew.find(member => member.job === 'Director');
      const certification = releaseResponse.data.results.find(country => country.iso_3166_1 === 'US')?.release_dates[0]?.certification || 'N/A';
  
      return {
        ...detailsResponse.data,
        director: director ? director.name : 'Unknown',
        certification
      };
    } catch (error) {
      console.error("Error fetching movie details:", error);
      
      // Dodaj bardziej szczegółową obsługę błędu
      if (error.response && error.response.status === 404) {
        return {
          error: `Movie with ID ${movieId} not found.`,
          title: "Error",
          poster_path: null
        };
      }
      throw error;
    }
  };
  
  const ProfilePage = () => {
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [watchlistCount, setWatchlistCount] = useState(0);
    const [ratingsCount, setRatingsCount] = useState(0);
    const [favorites, setFavorites] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [showFavorites, setShowFavorites] = useState(false);
    const [showWatchlist, setShowWatchlist] = useState(false);
    const [userName, setUserName] = useState('');


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
              console.log(`${endpoint} count:`, count);
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
        if (!token || !showFavorites) return;
  
        try {
          const response = await fetch('http://localhost:5000/api/user/favorites', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (!response.ok) throw new Error('Failed to fetch favorites');
          const favoriteIds = await response.json();
  
          // Pobieramy szczegóły każdego filmu z TMDB
          const favoritesWithDetails = await Promise.all(favoriteIds.map(async (movieId) => {
            const movieDetails = await fetchMovieDetails(movieId);
            return {
              id: movieId,
              title: movieDetails.title,
              poster_path: movieDetails.poster_path
            };
          }));
  
          setFavorites(favoritesWithDetails);
        } catch (err) {
          console.error('Error fetching favorites:', err.message);
        }
      };
  
      fetchFavorites();
    }, [showFavorites]);
  
    useEffect(() => {
      const fetchWatchlist = async () => {
        const token = localStorage.getItem('access_token');
        if (!token || !showWatchlist) return;
  
        try {
          const response = await fetch('http://localhost:5000/api/user/watchlist', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (!response.ok) throw new Error('Failed to fetch watchlist');
          const watchlistIds = await response.json();
  
          const watchlistWithDetails = await Promise.all(watchlistIds.map(async (movieId) => {
            const movieDetails = await fetchMovieDetails(movieId);
            return {
              id: movieId,
              title: movieDetails.title,
              poster_path: movieDetails.poster_path
            };
          }));
  
          setWatchlist(watchlistWithDetails);
        } catch (err) {
          console.error('Error fetching watchlist:', err.message);
        }
      };
  
      fetchWatchlist();
    }, [showWatchlist]);
  
    const handleFavoritesClick = () => setShowFavorites(!showFavorites);
    const handleWatchlistClick = () => setShowWatchlist(!showWatchlist);
  
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-header">
            <div className="profile-info">
            <h2 className="username">Hello, {userName}!</h2> 
            </div>
          </div>
  
          <div className="stats-container">
            <div className="stat-item clickable" onClick={() => alert('Ratings functionality not implemented yet')}>
              <h3>{ratingsCount}</h3>
              <p>Your Ratings</p>
            </div>
            <div className="stat-item clickable" onClick={handleWatchlistClick}>
              <h3>{watchlistCount}</h3>
              <p>Watchlist</p>
            </div>
            <div className="stat-item clickable" onClick={handleFavoritesClick}>
              <h3>{favoritesCount}</h3>
              <p>Favourites</p>
            </div>
          </div>
  
          {showFavorites && (
            <div className="favorites-container">
              <h2>Favorites</h2>
              <div className="favorites-list">
                {favorites.map(movie => (
                  <div key={movie.id} className="favorite-movie">
                    <img 
                      src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} 
                      alt={movie.title}
                    />
                    <h3>{movie.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {showWatchlist && (
            <div className="watchlist-container">
              <h2>Watchlist</h2>
              <div className="watchlist-list">
                {watchlist.map(movie => (
                  <div key={movie.id} className="watchlist-movie">
                    <img 
                      src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} 
                      alt={movie.title}
                    />
                    <h3>{movie.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default ProfilePage;