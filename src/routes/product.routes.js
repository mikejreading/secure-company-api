const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductGUID
} = require('../middleware/product.validation');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');

router
  .route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin'), validateCreateProduct, createProduct);

router
  .route('/:productGUID')
  .get(protect, validateProductGUID, getProduct)
  .put(protect, authorize('admin'), validateUpdateProduct, updateProduct)
  .delete(protect, authorize('admin'), validateProductGUID, deleteProduct);

module.exports = router;
