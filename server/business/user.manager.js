import PasswordDAO from '../DAO/passwordDAO';
import TokenDAO from '../DAO/tokenDAO';
import UserDAO from '../DAO/userDAO';
import applicationException from '../service/applicationException';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { fetchRecommendations } from '../shared/tmdb';
import { fetchItemType  } from '../shared/tmdb';


function create(context) {

  function hashString(password) {
    return crypto.createHash('sha1').update(password).digest('hex');
  }

  async function authenticate(name, password) {
    const user = await UserDAO.getByEmailOrName(name);

    if (!user) {
      throw applicationException.new(applicationException.UNAUTHORIZED, 'User with that email does not exist');
    }

    await PasswordDAO.authorize(user.id, hashString(password));

    const userData = {
      id: user.id || user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin
    };

    const token = await TokenDAO.create(userData);

    return getToken(token);
  }

  function getToken(token) {
    return { token: token.value };
  }

  async function createNewOrUpdate(userData) {
    if (userData.id) {
    } else {
    }

    const user = await UserDAO.createNewOrUpdate(userData);

    if (userData.password) {
      return await PasswordDAO.createOrUpdate({
        userId: user.id,
        password: hashString(userData.password)
      });
    } else {
      return user;
    }
  }

  async function removeHashSession(userId) {
    return await TokenDAO.remove(userId);
  }

  async function addFavorite(userId, movieId) {
    const user = await UserDAO.get(userId);

    if (!user) {
      console.error(`User with id=${userId} not found`);
      throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
    }

    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
    } else {
    }
    await UserDAO.createNewOrUpdate(user);

    return user;
  }

  async function removeFavorite(userId, movieId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid userId format: ${userId}`);
      throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID format');
    }

    const user = await UserDAO.get(userId);
    if (!user) {
      console.error(`User with id=${userId} not found`);
      throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
    }

    if (user.favorites.includes(movieId)) {
      user.favorites = user.favorites.filter((id) => id !== movieId);
    } else {
    }
    await UserDAO.createNewOrUpdate(user);

    return user;
  }

  async function addToWatchlist(userId, movieId) {
    const user = await UserDAO.get(userId);

    if (!user) {
      console.error(`User with id=${userId} not found`);
      throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
    }

    if (!user.watchlist.includes(movieId)) {
      user.watchlist.push(movieId);
    } else {
    }
    await UserDAO.createNewOrUpdate(user);

    return user;
  }

  async function removeFromWatchlist(userId, movieId) {
    const user = await UserDAO.get(userId);
    if (!user) {
      console.error(`User with id=${userId} not found`);
      throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
    }

    user.watchlist = user.watchlist.filter((id) => id !== movieId);
    await UserDAO.createNewOrUpdate(user);

    return user;
  }

  async function rateMovie(userId, movieId, rating) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid userId format: ${userId}`);
      throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID format');
    }

    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      console.error(`Invalid rating value: ${rating}`);
      throw applicationException.new(applicationException.BAD_REQUEST, 'Rating must be between 0 and 10');
    }

    if (!movieId || typeof movieId !== 'string') {
      console.error(`Invalid movieId format: ${movieId}`);
      throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid movie ID format');
    }

    const user = await UserDAO.get(userId);
    if (!user) {
      console.error(`User with id=${userId} not found`);
      throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
    }

    user.ratings.set(movieId, rating);
    await UserDAO.createNewOrUpdate(user);

    return user.ratings;
  }

  async function addComment(userId, movieId, text) {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid userId format: ${userId}`);
      throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID format');
    }

    if (!movieId || typeof movieId !== 'string') {
      console.error(`Invalid movieId format: ${movieId}`);
      throw applicationException.new(applicationException.BAD_REQUEST, 'Movie ID is required and must be a string');
    }

    if (!text || typeof text !== 'string') {
      console.error(`Invalid commentText format: ${text}`);
      throw applicationException.new(applicationException.BAD_REQUEST, 'Comment text is required and must be a string');
    }

    const user = await UserDAO.get(userId);
    if (!user) {
      console.error(`User with id=${userId} not found`);
      throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
    }

    const comment = await UserDAO.addComment(userId, movieId, text);

    return comment;
  }

  async function getCommentsByMovie(movieId) {

    if (!movieId || typeof movieId !== 'string') {
      console.error(`Invalid movieId format: ${movieId}`);
      throw applicationException.new(applicationException.BAD_REQUEST, 'Movie ID is required and must be a string');
    }

    const comments = await UserDAO.getCommentsByMovie(movieId);

    return comments;
  }

  async function getRecommendations(userId) {
    const user = await UserDAO.get(userId);
  
    if (!user || !user.favorites || user.favorites.length === 0) {
      throw applicationException.new(applicationException.NOT_FOUND, 'User has no favorites');
    }
  
    let recommendations = [];
    let reason = '';
    let randomIndex = Math.floor(Math.random() * user.favorites.length);
    let favoriteId = user.favorites[randomIndex];
  
    try {
      // Próba pobrania rekomendacji dla ulubionego filmu
      const { isTVShow, details } = await fetchItemType(favoriteId);
  
      recommendations = await fetchRecommendations(favoriteId, isTVShow);
  
      // Jeśli brak rekomendacji, spróbuj z następnym ulubionym filmem
      if (recommendations.length === 0) {
        randomIndex = (randomIndex + 1) % user.favorites.length;
        favoriteId = user.favorites[randomIndex];
  
        const { isTVShow: fallbackIsTVShow, details: fallbackDetails } = await fetchItemType(favoriteId);
        recommendations = await fetchRecommendations(favoriteId, fallbackIsTVShow);
  
        reason = fallbackDetails.title || fallbackDetails.name;
      } else {
        reason = details.title || details.name;
      }
  
      // Jeśli brak rekomendacji po dwóch próbach, zwróć odpowiedni komunikat
      if (recommendations.length === 0) {
        return {
          reason: 'No recommendations available',
          recommendations: [],
        };
      }
  
      return {
        reason: reason,
        recommendations: recommendations,
      };
    } catch (error) {
      console.error('Błąd podczas pobierania rekomendacji:', error);
      throw applicationException.new(applicationException.INTERNAL_ERROR, 'Nie udało się pobrać rekomendacji');
    }
  }


  return {
    authenticate: authenticate,
    createNewOrUpdate: createNewOrUpdate,
    removeHashSession: removeHashSession,
    addFavorite: addFavorite,
    removeFavorite: removeFavorite,
    addToWatchlist: addToWatchlist,
    removeFromWatchlist: removeFromWatchlist,
    rateMovie: rateMovie,
    addComment: addComment,
    getCommentsByMovie: getCommentsByMovie,
    getRecommendations: getRecommendations,
  };
}

export default {
  create: create
};