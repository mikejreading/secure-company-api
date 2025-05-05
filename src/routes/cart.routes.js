const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  validateAddItem,
  validateUpdateItem,
  validateRemoveItem,
  validateUserId
} = require('../middleware/cart.validation');
const {
  getAllCarts,
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
} = require('../controllers/cart.controller');

// Admin routes
router
  .route('/all')
  .get(protect, authorize('admin'), getAllCarts);

// User cart routes
router
  .route('/')
  .get(protect, getCart)
  .post(protect, validateAddItem, addItem)
  .delete(protect, clearCart);

router
  .route('/items/:productGUID')
  .put(protect, validateUpdateItem, updateItem)
  .delete(protect, validateRemoveItem, removeItem);

// Admin routes for specific user's cart
router
  .route('/user/:userId')
  .get(protect, validateUserId, getCart)
  .post(protect, authorize('admin'), validateUserId, validateAddItem, addItem)
  .delete(protect, authorize('admin'), validateUserId, clearCart);

router
  .route('/user/:userId/items/:productGUID')
  .put(protect, authorize('admin'), validateUserId, validateUpdateItem, updateItem)
  .delete(protect, authorize('admin'), validateUserId, validateRemoveItem, removeItem);

module.exports = router;
