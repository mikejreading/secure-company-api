const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  validateAddItem,
  validateUpdateItem,
  validateRemoveItem
} = require('../middleware/cart.validation');
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
} = require('../controllers/cart.controller');

router
  .route('/')
  .get(protect, getCart)
  .post(protect, validateAddItem, addItem)
  .delete(protect, clearCart);

router
  .route('/items/:productGUID')
  .put(protect, validateUpdateItem, updateItem)
  .delete(protect, validateRemoveItem, removeItem);

module.exports = router;
