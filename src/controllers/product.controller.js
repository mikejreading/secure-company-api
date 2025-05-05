const Product = require('../models/product.model');
const { asyncHandler, createResponse, notFound } = require('../utils/controller');

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  createResponse(res, 201, product);
});

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  createResponse(res, 200, products);
});

exports.getProduct = asyncHandler(async (req, res) => {
  // Validate UUID format
  const uuidV4Regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  if (!uuidV4Regex.test(req.params.productGUID)) {
    return createResponse(res, 400, { 
      message: 'Validation error',
      errors: ['Invalid product GUID format']
    });
  }

  const product = await Product.findOne({ productGUID: req.params.productGUID });
  if (!product) return notFound(res, 'Product');
  createResponse(res, 200, product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { productGUID: req.params.productGUID },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) return notFound(res, 'Product');
  createResponse(res, 200, product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ productGUID: req.params.productGUID });
  if (!product) return notFound(res, 'Product');
  createResponse(res, 204);
});
