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
        }
      }
    }
  
    if (!details) {
      throw new Error(`Item with ID not found: ${id}`);
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