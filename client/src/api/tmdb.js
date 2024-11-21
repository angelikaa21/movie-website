import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'e8017557aecacd6272fd3a1654fdf1f7';

export const fetchTrendingMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
  }
};

export const fetchPopularMovies = async (page) => {
  try {
      const response = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
      return response.data;
  } catch (error) {
      console.error("Error fetching popular movies:", error);
      throw error;
  }
};

export const fetchPopularTVShows = async (page) => {
  try {
    const response = await axios.get(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    throw error;
  }
};

export const fetchMovieDetails = async (movieId) => {
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
    throw error;
  }
};

export const fetchWatchProviders = async (movieId) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
    return response.data.results.PL || null;
  } catch (error) {
    console.error("Error fetching watch providers:", error);
    return null;
  }
};

export const fetchMovieTrailer = async (movieId) => {
  try {
      const response = await axios.get(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
      return response.data.results.find(video => video.type === 'Trailer');
  } catch (error) {
      console.error("Error fetching movie trailer:", error);
      return null;
  }
};

export const fetchCast = async (movieId) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
    return response.data.cast;
  } catch (error) {
    console.error("Error fetching cast:", error);
    throw error;
  }
};

export const fetchTVShowDetails = async (tvShowId) => {
  try {
      const [detailsResponse, creditsResponse] = await Promise.all([
          axios.get(`${BASE_URL}/tv/${tvShowId}?api_key=${API_KEY}&language=en-US`),
          axios.get(`${BASE_URL}/tv/${tvShowId}/credits?api_key=${API_KEY}`),
      ]);

      const creators = detailsResponse.data.created_by || [];
      const director = creators.length > 0 
          ? creators.map(creator => creator.name).join(', ') 
          : 'Not available';

      return {
          ...detailsResponse.data,
          director,
      };
  } catch (error) {
      console.error("Error fetching TV show details:", error);
      throw error;
  }
};

export const fetchTVShowTrailer = async (tvShowId) => {
  try {
      const response = await axios.get(`${BASE_URL}/tv/${tvShowId}/videos?api_key=${API_KEY}&language=en-US`);
      return response.data.results.find(video => video.type === 'Trailer');
  } catch (error) {
      console.error("Error fetching TV show trailer:", error);
      return null;
  }
};

export const fetchTVCast = async (tvShowId) => {
  try {
    const response = await axios.get(`${BASE_URL}/tv/${tvShowId}/credits?api_key=${API_KEY}`);
    return response.data.cast;
  } catch (error) {
    console.error("Error fetching TV show cast:", error);
    throw error;
  }
};

export const fetchSimilar = async (id, isTVShow = false) => {
  try {
    const url = `${BASE_URL}/${isTVShow ? 'tv' : 'movie'}/${id}/similar?api_key=${API_KEY}&language=en-US`;
    const response = await axios.get(url);

    const filteredResults = response.data.results.filter(item => item.vote_average >= 5);

    const sortedResults = filteredResults.sort((a, b) => b.vote_average - a.vote_average);

    return sortedResults;
  } catch (error) {
    console.error("Error fetching similar items:", error);
    return [];
  }
};
export const searchMulti = async (query) => {
  if (!query) {
    console.warn("Search query is empty.");
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/search/multi`, {
      params: {
        api_key: API_KEY,
        query: query.trim(),
        include_adult: false,
        language: 'en-US',
        page: 1
      }
    });
    console.log("API Response:", response.data.results);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
};

export const fetchFilteredMovies = async (page, genre = '', year = '', sortBy = 'popularity.desc') => {
  try {
    const params = {
      api_key: API_KEY,
      with_genres: genre,
      sort_by: sortBy,
      page,
      ...(year && { 'primary_release_year': year }),
    };

    const response = await axios.get(`${BASE_URL}/discover/movie`, { params });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching filtered movies:", error);
    return [];
  }
};

export const fetchFilteredTVShows = async (page, genre = '', year = '', sortBy = 'popularity.desc') => {
  try {
    const params = {
      api_key: API_KEY,
      with_genres: genre,
      sort_by: sortBy,
      page,
      ...(year && { 'first_air_date_year': year }),
    };

    const response = await axios.get(`${BASE_URL}/discover/tv`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching filtered TV shows:", error);
    return { results: [] };
  }
};

export const fetchUpcomingMovies = async () => {
  try {
    let allMovies = [];
    let page = 1;

    while (page <= 5) {
      const response = await axios.get(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`);
      allMovies = [...allMovies, ...response.data.results];
      page += 1;
    }

    const futureMovies = allMovies.filter(movie => {
      const releaseDate = movie.release_date;
      const today = new Date();
      return new Date(releaseDate) > today;
    });

    const uniqueMovies = futureMovies.filter((value, index, self) => {
      return index === self.findIndex((t) => (
        t.id === value.id
      ));
    });

    return uniqueMovies;
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    return [];
  }
};