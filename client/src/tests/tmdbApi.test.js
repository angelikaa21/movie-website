import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchMovieDetails,
  fetchWatchProviders,
} from '../api/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'e8017557aecacd6272fd3a1654fdf1f7';

describe('TMDB API Integration Tests', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  test('fetchTrendingMovies: should return a list of trending movies', async () => {
    const mockData = {
      results: [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ],
    };
    mock.onGet(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`).reply(200, mockData);

    const result = await fetchTrendingMovies();

    expect(result).toEqual(mockData.results);
  });

  test('fetchMovieDetails: should return movie details including director and certification', async () => {

    const movieId = 123;
    const mockDetails = { id: movieId, title: 'Movie Title' };
    const mockCredits = { crew: [{ job: 'Director', name: 'John Doe' }] };
    const mockReleaseDates = {
      results: [{ iso_3166_1: 'US', release_dates: [{ certification: 'PG-13' }] }],
    };

    mock.onGet(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`).reply(200, mockDetails);
    mock.onGet(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`).reply(200, mockCredits);
    mock.onGet(`${BASE_URL}/movie/${movieId}/release_dates?api_key=${API_KEY}`).reply(200, mockReleaseDates);

    const result = await fetchMovieDetails(movieId);

    expect(result).toEqual({
      ...mockDetails,
      director: 'John Doe',
      certification: 'PG-13',
    });
  });

  test('fetchWatchProviders: should return watch providers for a movie', async () => {

    const movieId = 123;
    const mockData = { results: { PL: { flatrate: [{ provider_name: 'Netflix' }] } } };
    mock.onGet(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`).reply(200, mockData);

    const result = await fetchWatchProviders(movieId);

    expect(result).toEqual(mockData.results.PL);
  });

  test('fetchTrendingMovies: should handle API errors gracefully', async () => {

    mock.onGet(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`).reply(500);


    const result = await fetchTrendingMovies();

    expect(result).toBeUndefined();
  });

  test('fetchMovieDetails: should handle missing director gracefully', async () => {

    const movieId = 456;
    const mockDetails = { id: movieId, title: 'Another Movie Title' };
    const mockCredits = { crew: [] };
    const mockReleaseDates = {
      results: [{ iso_3166_1: 'US', release_dates: [{ certification: 'PG-13' }] }],
    };
  
    mock.onGet(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`).reply(200, mockDetails);
    mock.onGet(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`).reply(200, mockCredits);
    mock.onGet(`${BASE_URL}/movie/${movieId}/release_dates?api_key=${API_KEY}`).reply(200, mockReleaseDates);

    const result = await fetchMovieDetails(movieId);
  
    expect(result).toEqual({
      ...mockDetails,
      director: 'Unknown',
      certification: 'PG-13',
    });
  });
  
  test('fetchWatchProviders: should handle missing providers gracefully', async () => {

    const movieId = 789;
    const mockData = { results: {} };
  
    mock.onGet(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`).reply(200, mockData);
  
    const result = await fetchWatchProviders(movieId);

    expect(result).toBeNull();
  });
  

  test('fetchTrendingMovies: should handle empty response gracefully', async () => {
    const mockData = { results: [] };

    mock.onGet(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`).reply(200, mockData);

    const result = await fetchTrendingMovies();

    expect(result).toEqual([]);
  });
  
  test('fetchMovieDetails: should handle missing certification and director gracefully', async () => {
  
    const movieId = 999;
    const mockDetails = { id: movieId, title: 'No Certification or Director' };
    const mockCredits = { crew: [] };
    const mockReleaseDates = { results: [] };
  
    mock.onGet(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`).reply(200, mockDetails);
    mock.onGet(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`).reply(200, mockCredits);
    mock.onGet(`${BASE_URL}/movie/${movieId}/release_dates?api_key=${API_KEY}`).reply(200, mockReleaseDates);
  
    const result = await fetchMovieDetails(movieId);
  
    expect(result).toEqual({
      ...mockDetails,
      director: 'Unknown',
      certification: 'N/A',
    });
  });
  
  test('fetchWatchProviders: should handle API errors gracefully', async () => {

    const movieId = 555;
    mock.onGet(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`).reply(500);
  
    const result = await fetchWatchProviders(movieId);
  
    expect(result).toBeNull();
  });
  
  test('fetchTrendingMovies: should successfully fetch and return data', async () => {

    const mockData = {
      results: [
        { id: 101, title: 'Test Movie' },
      ],
    };
    mock.onGet(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`).reply(200, mockData);
  
    const result = await fetchTrendingMovies();
  
    expect(result).toEqual([{ id: 101, title: 'Test Movie' }]);
  });
  
  
});
