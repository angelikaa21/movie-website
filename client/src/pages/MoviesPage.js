import React, { useEffect, useState } from 'react';
import { fetchPopularMovies, fetchFilteredMovies } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import '../styles/MoviesPage.css';

const MoviesPage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'popularity.desc',
    });
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

    const loadMovies = async () => {
        setLoading(true);
        try {
            const data = await fetchPopularMovies(page);
            if (data && data.results) {
                setMovies(prevMovies => [
                    ...prevMovies,
                    ...data.results.filter(movie => !prevMovies.some(prevMovie => prevMovie.id === movie.id)),
                ]);
            }
        } catch (error) {
            console.error("Error fetching popular movies:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadFilteredMovies = async () => {
        setLoading(true);
        try {
            const data = await fetchFilteredMovies(page, filters.genre, filters.year, filters.sortBy, 100); // Przekazanie wartości minVoteCount
            if (data && data.length > 0) {
                setMovies(prevMovies => [
                    ...prevMovies,
                    ...data.filter(movie => !prevMovies.some(prevMovie => prevMovie.id === movie.id)),
                ]);
            } else {
                setMovies([]);
            }
        } catch (error) {
            console.error("Error fetching filtered movies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filters.genre || filters.year || filters.sortBy) {
            loadFilteredMovies();
        } else {
            loadMovies();
        }
    }, [page, filters]);

    const handleLoadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
        setPage(1);
        setMovies([]);
    };

    const toggleYearDropdown = () => {
        setYearDropdownOpen(!yearDropdownOpen);
    };

    const handleYearSelect = (year) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            year: year,
        }));
        setPage(1);
        setMovies([]);
        setYearDropdownOpen(false);
    };

    return (
        <div className="movies-page">
            <h1 className="page-title">Movies</h1>
            
            <div className="filter-container">
                <select name="genre" value={filters.genre} onChange={handleFilterChange} className="button-common select-style">
                    <option value="">All Genres</option>
                    <option value="28">Action</option>
                    <option value="35">Comedy</option>
                    <option value="18">Drama</option>
                    <option value="53">Thriller</option>
                    <option value="12">Adventure</option>
                </select>
                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="button-common select-style">
                    <option value="popularity.desc">Most Popular</option>
                    <option value="popularity.asc">Least Popular</option>
                    <option value="vote_average.desc">Highest Rated</option>
                    <option value="vote_average.asc">Lowest Rated</option>
                </select>
            
             <select name="year" value={filters.year} onChange={handleFilterChange} className="button-common select-style">
                <option value="">All Years</option>
                {["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"].map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            </div>
            <div className="movies-container">
                {movies.length > 0 ? (
                    movies.map(movie => (
                        <MovieCard key={movie.id} movie={movie} type="movies" />
                    ))
                ) : (
                    <p>No movies found.</p>
                )}
            </div>
            {loading && <p>Loading movies...</p>}

            <div className="load-more-container">
                {!loading && movies.length > 0 && (
                    <button onClick={handleLoadMore} className="load-more-button">Load More</button>
                )}
            </div>
        </div>
    );
};

export default MoviesPage;
