import mongoose from 'mongoose';
import business from '../business/business.container';
import applicationException from '../service/applicationException';
import auth from '../middleware/auth';
import userDAO from '../DAO/userDAO';
import express from 'express';

const router = express.Router();

const userEndpoint = (router) => {

  router.post('/api/user/auth', async (request, response) => {
    try {

      if (!request.body.login || !request.body.password) {
        return response.status(400).send('Login and password are required');
      }

      const result = await business.getUserManager(request).authenticate(
        request.body.login,
        request.body.password
      );

      response.status(200).json({ token: result.token });
    } catch (error) {
      console.error('Authentication error:', error);
      applicationException.errorHandler(error, response);
    }
  });

  router.post('/api/user/create', async (request, response) => {
    try {

      const { email, name, password } = request.body;
      if (!email || !name || !password) {
        return response.status(400).send('Email, name, and password are required');
      }

      const result = await business.getUserManager(request).createNewOrUpdate(request.body);
      response.status(200).json(result);
    } catch (error) {
      console.error('User creation error:', error);
      applicationException.errorHandler(error, response);
    }
  });

  router.delete('/api/user/logout/:userId', auth, async (request, response) => {
    try {
      const userId = request.params.userId;

      if (userId !== request.user.id) {
        return response.status(403).send('Unauthorized to logout this user');
      }

      const result = await business.getUserManager(request).removeHashSession(userId);
      response.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      applicationException.errorHandler(error, response);
    }
  });

  router.post('/api/user/favorites/add', auth, async (req, res) => {
    try {
      const { movieId } = req.body;

      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID');
      }

      const updatedUser = await business.getUserManager(req).addFavorite(userId, movieId);

      res.status(200).json(updatedUser.favorites);
    } catch (error) {
      console.error('Add favorite error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.post('/api/user/favorites/remove', auth, async (req, res) => {
    try {
      const { movieId } = req.body;

      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID');
      }

      const updatedUser = await business.getUserManager(req).removeFavorite(userId, movieId);

      res.status(200).json(updatedUser.favorites);
    } catch (error) {
      console.error('Remove favorite error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.get('/api/user/favorites/check', auth, async (req, res) => {
    try {
      const { movieId } = req.query;

      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID');
      }

      const user = await userDAO.get(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }

      const isFavorite = user.favorites.includes(movieId);
      res.status(200).json({ isFavorite });
    } catch (error) {
      console.error('Check favorite error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.get('/api/user/favorites/count', auth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await userDAO.get(userId);

      if (!user) {
        return res.status(404).send('User not found');
      }

      const favoriteCount = user.favorites.length;
      res.status(200).json({ count: favoriteCount });
    } catch (error) {
      console.error('Error fetching favorite count:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.post('/api/user/watchlist/add', auth, async (req, res) => {
    try {
      const { movieId } = req.body;
      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;
      const updatedUser = await business.getUserManager(req).addToWatchlist(userId, movieId);

      res.status(200).json(updatedUser.watchlist);
    } catch (error) {
      console.error('Add to watchlist error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.post('/api/user/watchlist/remove', auth, async (req, res) => {
    try {
      const { movieId } = req.body;
      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;
      const updatedUser = await business.getUserManager(req).removeFromWatchlist(userId, movieId);

      res.status(200).json(updatedUser.watchlist);
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.get('/api/user/watchlist/check', auth, async (req, res) => {
    try {
      const { movieId } = req.query;
      if (!movieId) return res.status(400).send('Movie ID is required');

      const userId = req.user.userId;
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        return res.status(400).send('Invalid user ID');
      }

      const user = await userDAO.get(userId);
      if (!user) return res.status(404).send('User not found');

      const isToWatch = user.watchlist.includes(movieId);
      res.status(200).json({ isToWatch });
    } catch (error) {
      console.error('Check watchlist error:', error);
      res.status(500).send('Internal server error');
    }
  });

  router.get('/api/user/watchlist/count', auth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await userDAO.get(userId);

      if (!user) {
        return res.status(404).send('User not found');
      }

      const watchlistCount = user.watchlist.length;
      res.status(200).json({ count: watchlistCount });
    } catch (error) {
      console.error('Error fetching watchlist count:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.post('/api/user/ratings', auth, async (req, res) => {
    try {
      const { movieId, rating } = req.body;
      const userId = req.user.userId;

      if (!movieId || typeof rating !== 'number') {
        return res.status(400).send('Movie ID and a valid numeric rating are required');
      }

      const updatedRatings = await business.getUserManager(req).rateMovie(userId, movieId, rating);
      res.status(200).json(updatedRatings);
    } catch (error) {
      console.error('Rate movie error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.get('/api/user/ratings/check', auth, async (req, res) => {
    try {
      const { movieId } = req.query;

      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        return res.status(400).send('Invalid user ID');
      }

      const user = await userDAO.get(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }

      const userRating = user.ratings.get(movieId);

      res.status(200).json({ rated: !!userRating, rating: userRating || null });
    } catch (error) {
      console.error('Check rating error:', error);
      res.status(500).send('Internal server error');
    }
  });

  router.post('/api/user/comments', auth, async (req, res, next) => {
    const { movieId, text } = req.body;
    const userId = req.user.userId;

    if (!movieId || !text) {
      return res.status(400).json({ error: 'Movie ID and comment text are required' });
    }

    try {
      const result = await business.getUserManager(req).addComment(userId, movieId, text);
      res.status(201).json(result);
    } catch (err) {
      console.error('Error adding comment:', err);
      next(err);
    }
  });

  router.get('/api/user/comments/:movieId', async (req, res, next) => {
    const { movieId } = req.params;

    if (!movieId || isNaN(movieId)) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }

    try {
      const comments = await business.getUserManager(req).getCommentsByMovie(movieId);
      res.status(200).json(comments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      next(err);
    }
  });


  router.get('/api/user/recommendations', auth, async (req, res) => {
    try {
      const userId = req.user.userId;
  
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID');
      }
  
      const { reason, recommendations } = await business.getUserManager(req).getRecommendations(userId);
  
      res.status(200).json({ reason, recommendations });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      applicationException.errorHandler(error, res);
    }
  });
  

  return router;
};

export default userEndpoint;
