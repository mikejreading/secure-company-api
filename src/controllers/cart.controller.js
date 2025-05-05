const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const { asyncHandler, createResponse, notFound } = require('../utils/controller');

// Create or get user's cart
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: []
    });
  }
  
  createResponse(res, 200, cart);
});

// Add item to cart
exports.addItem = asyncHandler(async (req, res) => {
  const { productGUID, quantity } = req.body;

  // Verify product exists
  const product = await Product.findOne({ productGUID });
  if (!product) return notFound(res, 'Product');

  let cart = await Cart.findOne({ user: req.user.id });
  
  // Create cart if it doesn't exist
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: []
    });
  }

  // Check if item already exists in cart
  const itemIndex = cart.items.findIndex(item => item.productGUID === productGUID);
  
  if (itemIndex > -1) {
    // Update existing item
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      productGUID,
      productName: product.productName,
      quantity
    });
  }

  await cart.save();
  createResponse(res, 200, cart);
});

// Update item quantity
exports.updateItem = asyncHandler(async (req, res) => {
  const { productGUID } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return notFound(res, 'Cart');

  const itemIndex = cart.items.findIndex(item => item.productGUID === productGUID);
  if (itemIndex === -1) return notFound(res, 'Item in cart');

  if (quantity === 0) {
    // Remove item if quantity is 0
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  createResponse(res, 200, cart);
});

// Remove item from cart
exports.removeItem = asyncHandler(async (req, res) => {
  const { productGUID } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return notFound(res, 'Cart');

  const itemIndex = cart.items.findIndex(item => item.productGUID === productGUID);
  if (itemIndex === -1) return notFound(res, 'Item in cart');

  cart.items.splice(itemIndex, 1);
  await cart.save();
  
  createResponse(res, 200, cart);
});

// Clear cart
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return notFound(res, 'Cart');

  cart.items = [];
  await cart.save();
  
  createResponse(res, 200, cart);
});
