import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY || 'twój_klucz_api'; // Upewnij się, że masz ten klucz w pliku .env

/**
 * Pobiera podobne filmy/seriale z TMDB.
 * @param {string} id - ID filmu lub serialu.
 * @param {boolean} isTVShow - True, jeśli to serial, False, jeśli film.
 * @param {string} id - ID filmu lub serialu.
 * @returns {Promise<Array>} - Lista podobnych filmów/seriali.
 * @returns {Promise<Object>} - Szczegóły filmu/serialu.
 */
export const fetchRecommendations = async (id, isTVShow = false) => {
    try {
      const url = `${BASE_URL}/${isTVShow ? 'tv' : 'movie'}/${id}/recommendations?api_key=${API_KEY}&language=en-US`;
      const response = await axios.get(url);
  
      const filteredResults = response.data.results.filter(item => item.vote_average >= 5);
  
      return filteredResults.sort((a, b) => b.vote_average - a.vote_average);
    } catch (error) {
      console.error('Błąd podczas pobierania rekomendacji:', error);
      return [];
    }
  };
  
  export const fetchItemType = async (id) => {
    let isTVShow = false;
    let details = null;
  
    try {
      // Sprawdzenie dla filmów
      const movieResponse = await axios.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
      if (movieResponse.status === 200) {
        isTVShow = false;
        details = movieResponse.data;
      }
    } catch (movieError) {
      if (movieError.response?.status !== 404) {
        console.error(`Błąd podczas sprawdzania filmu (id=${id}):`, movieError.message);
      }
    }
  
    if (!details) {
      try {
        // Sprawdzenie dla seriali
        const tvResponse = await axios.get(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
        if (tvResponse.status === 200) {
          isTVShow = true;
          details = tvResponse.data;
        }
      } catch (tvError) {
        if (tvError.response?.status !== 404) {
          console.error(`Błąd podczas sprawdzania serialu (id=${id}):`, tvError.message);
        }
      }
    }
  
    if (!details) {
      throw new Error(`Nie znaleziono elementu o ID: ${id}`);
    }
  
    return { isTVShow, details };
  };
  
  export const fetchItemDetails = async (id, isTVShow = false) => {
    try {
      const url = `${BASE_URL}/${isTVShow ? 'tv' : 'movie'}/${id}?api_key=${API_KEY}&language=en-US`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania szczegółów elementu:', error);
      throw error;
    }
  };