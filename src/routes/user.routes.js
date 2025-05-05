const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateUserUpdate } = require('../middleware/validation.middleware');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');

const router = express.Router();

router.use(protect); // Protect all routes

router
  .route('/')
  .get(authorize('admin'), getAllUsers);

router
  .route('/:id')
  .get(getUser)
  .put(validateUserUpdate, updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
