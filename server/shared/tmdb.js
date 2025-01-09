import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

/**
 * @param {string} id 
 * @param {boolean} isTVShow 
 * @param {string} id
 * @returns {Promise<Array>}
 * @returns {Promise<Object>} 
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