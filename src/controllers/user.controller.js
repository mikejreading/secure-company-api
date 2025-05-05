const User = require('../models/user.model');
const { asyncHandler, createResponse, notFound } = require('../utils/controller');

// Validate MongoDB ID format
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  createResponse(res, 200, users);
});

exports.getUser = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return createResponse(res, 500, { message: 'Internal server error' });
  }

  const user = await User.findById(req.params.id).select('-password');
  if (!user) return notFound(res, 'User');
  
  createResponse(res, 200, user);
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) return notFound(res, 'User');
  
  createResponse(res, 200, user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return notFound(res, 'User');
  
  createResponse(res, 204);
});
