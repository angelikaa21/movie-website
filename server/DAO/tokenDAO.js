import mongoose from 'mongoose';
import config from '../config';
import momentWrapper from '../service/momentWrapper';
import jwt from 'jsonwebtoken';
import mongoConverter from '../service/mongoConverter';
import applicationException from '../service/applicationException';

const tokenTypeEnum = {
  authorization: 'authorization'
};

const tokenTypes = [tokenTypeEnum.authorization];

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  createDate: { type: Number, required: true },
  type: { type: String, enum: tokenTypes, required: true },
  value: { type: String, required: true }
}, {
  collection: 'token'
});

const TokenModel = mongoose.model('token', tokenSchema);

async function create(user) {
  if (!user || !user.id) {
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user object');
  }

  const access = 'auth';
  const userData = {
    userId: user.id || user._id,
    name: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    access: access
};
const value = jwt.sign(
    userData,
    config.JwtSecret,
    {
        expiresIn: '3h'
    }
);

  try {
    const result = await TokenModel({
      userId: user.id,
      type: 'authorization',
      value: value,
      createDate: momentWrapper.get().valueOf()
    }).save();

    if (result) {
      return mongoConverter(result);
    }
  } catch (err) {
    throw applicationException.new(applicationException.BAD_REQUEST, 'Error creating token');
  }
}

async function get(tokenValue) {
  try {
      const result = await TokenModel.findOne({ value: tokenValue });
      if (result) {
          return mongoConverter(result);
      }
  } catch (err) {
      console.error('Error verifying token:', err.message);
      throw applicationException.new(applicationException.UNAUTHORIZED, 'Token not valid');
  }

  throw applicationException.new(applicationException.UNAUTHORIZED, 'Token not found');
}

async function remove(userId) {
  return await TokenModel.deleteOne({ userId: userId });
}

export default {
  create: create,
  get: get,
  remove: remove,

  tokenTypeEnum: tokenTypeEnum,
  model: TokenModel
};
