/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_PRIVATE_KEY = 'ILikeDumpling';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  uniqueName: {
    type: String,
    required: true,
    trim: true,
    index: {
      unique: true,
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
    index: {
      unique: true,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
  },
  introduction: {
    type: String,
  },
  avatarUrl: {
    type: String,
    default: 'https://location-based-social-app.s3.us-east-2.amazonaws.com/user_avatar/default_avatar.jpg',
  },
  token: {
    type: String,
  },
}, {
  timestamps: true,
});

userSchema.methods.toJSON = function toJSON() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.token;

  return userObject;
};

userSchema.methods.generateAuthToken = async function generateAuthToken() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, JWT_PRIVATE_KEY);

  user.token = token;
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  // eslint-disable-next-line no-use-before-define
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function preSave(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  privateKey: JWT_PRIVATE_KEY,
};
