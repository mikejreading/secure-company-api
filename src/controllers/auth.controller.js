const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { asyncHandler, createResponse } = require('../utils/controller');

const generateToken = (id) => {
  const expiresIn = process.env.NODE_ENV === 'test' ? '1h' : process.env.JWT_EXPIRE || '24h';
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

const createTokenResponse = (res, statusCode, userId) => {
  const token = generateToken(userId);
  createResponse(res, statusCode, { token });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  createTokenResponse(res, 201, user._id);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return createResponse(res, 401, { message: 'Invalid credentials' });
  }

  createTokenResponse(res, 200, user._id);
});
