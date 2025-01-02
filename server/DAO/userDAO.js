import mongoose from 'mongoose';
import * as _ from 'lodash';
import Promise from 'bluebird';
import applicationException from '../service/applicationException';
import mongoConverter from '../service/mongoConverter';

const userRole = {
  admin: 'admin',
  user: 'user'
};

const userRoles = [userRole.admin, userRole.user];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: userRoles,
      default: userRole.admin,
      required: false
    },
    active: { type: Boolean, default: true, required: false },
    isAdmin: { type: Boolean, default: false, required: false },
    favorites: { type: [String], default: [] },
    watchlist: { type: [String], default: [] },
    ratings: {
      type: Map,
      of: {
        type: Number,
        min: 0,
        max: 10
      },
      default: {}
    },
    comments: [
      {
        movieId: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      },
    ]
  },
  {
    collection: 'user'
  }
);

userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    next(new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} must be unique`));
  } else {
    next(error);
  }
});

const UserModel = mongoose.model('user', userSchema);

function createNewOrUpdate(user) {
  return Promise.resolve()
    .then(() => {
      if (!user.id) {
        return new UserModel(user).save().then((result) => {
          if (result) {
            return mongoConverter(result);
          }
        });
      } else {
        return UserModel.findByIdAndUpdate(
          user.id,
          _.omit(user, 'id'),
          {
            new: true,
            runValidators: true
          }
        ).then(result => {
          if (result) {
            return mongoConverter(result);
          }
          throw applicationException.new(
            applicationException.NOT_FOUND,
            'User not found for update'
          );
        });
      }
    })
    .catch((error) => {
      console.error('Error in createNewOrUpdate:', error);
      if (error.name === 'ValidationError') {
        error = error.errors[Object.keys(error.errors)[0]];
        throw applicationException.new(
          applicationException.BAD_REQUEST,
          error.message
        );
      }
      throw error;
    });
}

async function getByEmailOrName(name) {
  const result = await UserModel.findOne({
    $or: [{ email: name }, { name: name }]
  });

  if (result) {
    return mongoConverter(result);
  }

  console.warn(`No user found with name/email: ${name}`);
  throw applicationException.new(
    applicationException.NOT_FOUND,
    'User not found'
  );
}

async function get(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`Invalid user ID format: ${id}`);
    throw applicationException.new(
      applicationException.BAD_REQUEST,
      'Invalid user ID format'
    );
  }

  const result = await UserModel.findById(id);
  if (result) {
    return mongoConverter(result);
  }
  console.error(`User not found with id: ${id}`);
  throw applicationException.new(
    applicationException.NOT_FOUND,
    'User not found'
  );
}


async function addFavorite(userId, movieId) {

  let user = await UserModel.findById(userId);

  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  if (!user.favorites.includes(movieId)) {
    user.favorites.push(movieId);
  } else {
  }
  await user.save();

  return mongoConverter(user);
}

async function removeFavorite(userId, movieId) {

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error(`Invalid userId format: ${userId}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID format');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  const initialLength = user.favorites.length;
  user.favorites = user.favorites.filter((id) => id !== movieId);

  if (user.favorites.length < initialLength) {
  } else {
  }
  await user.save();
  return mongoConverter(user);
}

async function addToWatchlist(userId, movieId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  if (!user.watchlist.includes(movieId)) {
    user.watchlist.push(movieId);
    await user.save();
  }
  return mongoConverter(user);
}

async function removeFromWatchlist(userId, movieId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  user.watchlist = user.watchlist.filter((id) => id !== movieId);
  await user.save();
  return mongoConverter(user);
}

async function rateMovie(userId, movieId, rating) {
  if (typeof rating !== 'number' || rating < 0 || rating > 10) {
    console.error(`Invalid rating value: ${rating}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Rating must be between 0 and 10');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }
  user.ratings.set(movieId, rating);

  await user.save();
  
  return mongoConverter(user);
}

async function addComment(userId, movieId, text) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID');
  }

  if (!movieId || typeof movieId !== 'string') {
    console.error(`Invalid movieId format: ${movieId}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Movie ID is required and must be a string');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  const comment = {
    movieId,
    text,
    createdAt: new Date()
  };
  user.comments.push(comment);

  await user.save();
  return mongoConverter(user);
}

async function getCommentsByMovie(movieId) {
  const users = await UserModel.find({ 'comments.movieId': movieId });

  const comments = users.flatMap((user) =>
    user.comments
      .filter((comment) => comment.movieId === movieId)
      .map((comment) => ({
        username: user.name,
        text: comment.text,
        createdAt: comment.createdAt
      }))
  );

  return comments;
}

export default {
  createNewOrUpdate,
  getByEmailOrName,
  get,
  addFavorite,
  removeFavorite,
  addToWatchlist,
  removeFromWatchlist,
  rateMovie,
  addComment,
  getCommentsByMovie,
  userRole,
  model: UserModel
};