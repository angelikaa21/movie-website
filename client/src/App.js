import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MoviesPage from './pages/MoviesPage';
import TVSeriesPage from './pages/TVSeriesPage';
import WhatToWatchPage from './pages/WhatToWatchPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import Home from './pages/Home';
import SearchResults from './components/SearchResults';
import './styles/App.css';
import './styles/Notification.css';

function App() {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]); 

  return (
    <div className="App">
      <Navbar setSearchResults={setSearchResults} />

      {/* Wyrenderuj wyniki wyszukiwania, jeśli są dostępne */}
      {searchResults.length > 0 && <SearchResults results={searchResults} />}

      <TransitionGroup component={null}>
        <CSSTransition 
          key={location.key}
          classNames="page-transition"
          timeout={500} 
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} /> {/* Strona główna */}
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/tv-series" element={<TVSeriesPage />} />
            <Route path="/what-to-watch" element={<WhatToWatchPage />} />
            <Route path="/movies/:id" element={<MovieDetailsPage isTVShow={false} />} />
            <Route path="/tv-series/:id" element={<MovieDetailsPage isTVShow={true} />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default App;
