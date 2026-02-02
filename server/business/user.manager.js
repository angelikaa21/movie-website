import PasswordDAO from '../DAO/passwordDAO';
import TokenDAO from '../DAO/tokenDAO';
import UserDAO from '../DAO/userDAO';
import applicationException from '../service/applicationException';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { fetchRecommendations } from '../shared/tmdb';
import { fetchItemType  } from '../shared/tmdb';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function sendRecommendationEmail(user) {
  const transporter = nodemailer.createTransport({
    host: "smtp.poczta.onet.pl",
    port: 465,
    secure: true,
    auth: {
      user: "moviemotions@op.pl",
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const { reason, recommendation } = await getEmailRecommendations(user._id);
    if (recommendation) {
      const mailOptions = {
        from: 'moviemotions@op.pl',
        to: user.email,
        subject: `Your Movie Recommendation: ${recommendation.title || recommendation.name}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 16px;">
          <!-- Logo Section -->
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="color: #ec7bb4; font-size: 36px; font-weight: bold;">MOVIE</span>
            <span style="color: #ffffff; background-color: #2c3e50; font-size: 36px; font-weight: bold; padding: 0 5px; border-radius: 5px;">MOTIONS</span>
          </div>
          <!-- Header Section -->
          <div style="border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #333; text-align: center; font-size: 24px;">Your Personalized Recommendation</h1>
            <p style="color: #666; text-align: center; font-size: 16px;">We found this for you based on your favorite: <strong style="color: #ec7bb4; font-size: 18px;">${reason}</strong></p>
          </div>
          <!-- Recommendation Section -->
          <div style="margin-bottom: 20px;">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 15px; font-size: 38px; font-weight: bold;">${recommendation.title || recommendation.name}</h2>
            <p style="color: #555; line-height: 1.6; font-size: 16px; text-align: justify;">${recommendation.overview}</p>
          </div>
          <!-- CTA Button Section -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px 0; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0;">
            <a href="http://localhost:3000/${recommendation.media_type === 'tv' ? 'tv-series' : 'movies'}/${recommendation.id}" 
               style="background-color: #ec7bb4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;"
               target="_blank">
              Learn more about this ${recommendation.media_type === 'tv' ? 'TV Show' : 'Movie'}
            </a>
          </div>
          <!-- Footer Section -->
          <div style="text-align: center; font-size: 14px; color: #999;">
            <p style="margin: 0;">Enjoy your recommendation!</p>
            <p style="margin: 5px 0;">
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
  } else {
    throw new Error('User has no favorites');
  }
} catch (error) {
  const noFavoritesMailOptions = {
    from: 'moviemotions@op.pl',
    to: user.email,
    subject: 'Add Favorites to Get Recommendations!',
    html: `
      <h1>Hey there!</h1>
      <p>Add something to your favorites to start receiving movie recommendations!</p>
    `,
  };

  const info = await transporter.sendMail(noFavoritesMailOptions);
  if (error.message !== 'User has no favorites') throw error;
}
}

async function getEmailRecommendations(userId) {
  try {
    const user = await UserDAO.get(userId);

    if (!user || !user.favorites || user.favorites.length === 0) {
      return {
        reason: 'User has no favorites',
        recommendation: null,
      };
    }

    let randomIndex = Math.floor(Math.random() * user.favorites.length);
    let favoriteId = user.favorites[randomIndex];
    let reason = '';

    const { isTVShow, details } = await fetchItemType(favoriteId);

    let recommendations = await fetchRecommendations(favoriteId, isTVShow);

    if (recommendations.length === 0) {
      randomIndex = (randomIndex + 1) % user.favorites.length;
      favoriteId = user.favorites[randomIndex];
      const { isTVShow: fallbackIsTVShow, details: fallbackDetails } = await fetchItemType(favoriteId);
      recommendations = await fetchRecommendations(favoriteId, fallbackIsTVShow);

      reason = fallbackDetails.title || fallbackDetails.name;
    } else {
      reason = details.title || details.name;
    }

    if (recommendations.length === 0) {
      return {
        reason: 'No recommendations available',
        recommendation: null,
      };
    }

    const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
    const { poster_path } = await fetchItemType(recommendation.id);

    return {
      reason: reason,
      recommendation: recommendation,
      poster_path: poster_path || '',
    };
  } catch (error) {
    console.error('Błąd podczas pobierania rekomendacji:', error);
    throw applicationException.new(applicationException.INTERNAL_ERROR, 'Nie udało się pobrać rekomendacji');
  }
}


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
      const { isTVShow, details } = await fetchItemType(favoriteId);
  
      recommendations = await fetchRecommendations(favoriteId, isTVShow);
  
      if (recommendations.length === 0) {
        randomIndex = (randomIndex + 1) % user.favorites.length;
        favoriteId = user.favorites[randomIndex];
  
        const { isTVShow: fallbackIsTVShow, details: fallbackDetails } = await fetchItemType(favoriteId);
        recommendations = await fetchRecommendations(favoriteId, fallbackIsTVShow);
  
        reason = fallbackDetails.title || fallbackDetails.name;
      } else {
        reason = details.title || details.name;
      }
  
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
      throw applicationException.new(applicationException.INTERNAL_ERROR, 'Failed to download recommendations');
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
  create: create,
  sendRecommendationEmail: sendRecommendationEmail,
  getEmailRecommendations: getEmailRecommendations,
};