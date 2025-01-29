import React, { useEffect, useState } from 'react';
import { fetchFilteredTVShows, fetchPopularTVShows } from '../api/tmdb'; 
import MovieCard from '../components/MovieCard';
import '../styles/MoviesPage.css';

const TVSeriesPage = () => {
    const [tvShows, setTVShows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'popularity.desc',
    });

    const loadTVShows = async () => {
        setLoading(true);
        try {
            const data = filters.genre || filters.year || filters.sortBy ? 
                await fetchFilteredTVShows(page, filters.genre, filters.year, filters.sortBy) : 
                await fetchPopularTVShows(page);

            setTVShows(prevShows => [
                ...prevShows,
                ...data.results.filter(show => !prevShows.some(prevShow => prevShow.id === show.id)),
            ]);
        } catch (error) {
            console.error("Error fetching TV shows:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTVShows();
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
        setTVShows([]);
    };

    return (
        <div className="tvseries-page">
            <h1 className="page-title">TV Series</h1>

            <div className="filter-container">
                <select name="genre" value={filters.genre} onChange={handleFilterChange} className="button-common select-style">
                    <option value="">All Genres</option>
                    <option value="10759">Action & Adventure</option>
                    <option value="16">Animation</option>
                    <option value="35">Comedy</option>
                    <option value="18">Drama</option>
                    <option value="80">Crime</option>
                    <option value="10765">Sci-Fi & Fantasy</option>
                    <option value="10767">Talk</option>
                </select>

                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="button-common select-style">
                    <option value="popularity.desc">Most Popular</option>
                    <option value="popularity.asc">Least Popular</option>
                    <option value="vote_average.desc">Highest Rated</option>
                    <option value="vote_average.asc">Lowest Rated</option>
                </select>

                <select name="year" value={filters.year} onChange={handleFilterChange} className="button-common select-style">
                    <option value="">All Years</option>
                    {["2024", "2023", "2022", "2021", "2020"].map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            <div className="tvseries-container">
                {tvShows.length > 0 ? (
                    tvShows.map(show => (
                        <MovieCard key={show.id} movie={show} type="tv-series" />
                    ))
                ) : (
                    <p>No TV series found.</p>
                )}
            </div>

            {loading && <p>Loading TV series...</p>}
            <div className="load-more-container">
                {!loading && tvShows.length > 0 && (
                    <button onClick={handleLoadMore} className="load-more-button">Load More</button>
                )}
            </div>
        </div>
    );
};

export default TVSeriesPage;
