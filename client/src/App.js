import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MoviesPage from './pages/MoviesPage';
import TVSeriesPage from './pages/TVSeriesPage';
import WhatToWatchPage from './pages/WhatToWatchPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import ProfilePage from './pages/ProfilePage';
import Home from './pages/Home';
import SearchResults from './components/SearchResults';

import './styles/App.css';
import './styles/Notification.css';
import store from './store/store';

const App = () => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Provider store={store}>
      <div className="App">
        <Navbar 
          setIsLoggedIn={setIsLoggedIn} 
          isLoggedIn={isLoggedIn} 
          setSearchResults={setSearchResults} 
          searchResults={searchResults}
        />
        
        {searchResults.length > 0 && <SearchResults results={searchResults} />}

        <TransitionGroup component={null}>
          <CSSTransition 
            key={location.key}
            classNames="page-transition"
            timeout={500}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/tv-series" element={<TVSeriesPage />} />
              <Route path="/what-to-watch" element={<WhatToWatchPage />} />
              <Route path="/movies/:id" element={<MovieDetailsPage isTVShow={false} />} />
              <Route path="/tv-series/:id" element={<MovieDetailsPage isTVShow={true} />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>

        <Footer />
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar 
          newestOnTop 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
        />
      </div>
    </Provider>
  );
};

export default App;
