const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const { asyncHandler, createResponse, notFound } = require('../utils/controller');

// Get all carts (admin only)
exports.getAllCarts = asyncHandler(async (req, res) => {
  const carts = await Cart.find().populate('user', 'name email');
  createResponse(res, 200, carts);
});

// Get cart by user ID (admin) or own cart (user)
exports.getCart = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;

  // Regular users can only access their own cart
  if (req.user.role !== 'admin' && userId !== req.user.id) {
    return createResponse(res, 403, { 
      message: 'Not authorized to access this cart'
    });
  }

  let cart = await Cart.findOne({ user: userId }).populate('user', 'name email');
  
  if (!cart) {
    // Only create cart if it's for the requesting user
    if (userId === req.user.id) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
      cart = await cart.populate('user', 'name email');
    } else {
      return createResponse(res, 404, { message: 'Cart not found' });
    }
  }
  
  createResponse(res, 200, cart);
});

// Add item to cart
exports.addItem = asyncHandler(async (req, res) => {
  const { productGUID, quantity } = req.body;
  const userId = req.params.userId || req.user.id;

  // Regular users can only modify their own cart
  if (req.user.role !== 'admin' && userId !== req.user.id) {
    return createResponse(res, 403, { 
      message: 'Not authorized to modify this cart'
    });
  }

  // Verify product exists
  const product = await Product.findOne({ productGUID });
  if (!product) {
    return createResponse(res, 404, { 
      message: 'Product not found'
    });
  }

  let cart = await Cart.findOne({ user: userId });
  
  // Create cart if it doesn't exist (only for own cart)
  if (!cart) {
    if (userId !== req.user.id) {
      return createResponse(res, 404, { 
        message: 'Cart not found'
      });
    }
    cart = await Cart.create({
      user: userId,
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
  cart = await cart.populate('user', 'name email');
  createResponse(res, 200, cart);
});

// Update item quantity
exports.updateItem = asyncHandler(async (req, res) => {
  const { productGUID } = req.params;
  const { quantity } = req.body;
  const userId = req.params.userId || req.user.id;

  // Regular users can only modify their own cart
  if (req.user.role !== 'admin' && userId !== req.user.id) {
    return createResponse(res, 403, { 
      message: 'Not authorized to modify this cart'
    });
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return createResponse(res, 404, { 
      message: 'Cart not found'
    });
  }

  const itemIndex = cart.items.findIndex(item => item.productGUID === productGUID);
  if (itemIndex === -1) {
    return createResponse(res, 404, { 
      message: 'Item not found in cart'
    });
  }

  if (quantity === 0) {
    // Remove item if quantity is 0
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  cart = await cart.populate('user', 'name email');
  createResponse(res, 200, cart);
});

// Remove item from cart
exports.removeItem = asyncHandler(async (req, res) => {
  const { productGUID } = req.params;
  const userId = req.params.userId || req.user.id;

  // Regular users can only modify their own cart
  if (req.user.role !== 'admin' && userId !== req.user.id) {
    return createResponse(res, 403, { 
      message: 'Not authorized to modify this cart'
    });
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return createResponse(res, 404, { 
      message: 'Cart not found'
    });
  }

  const itemIndex = cart.items.findIndex(item => item.productGUID === productGUID);
  if (itemIndex === -1) {
    return createResponse(res, 404, { 
      message: 'Item not found in cart'
    });
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  
  cart = await cart.populate('user', 'name email');
  createResponse(res, 200, cart);
});

// Clear cart
exports.clearCart = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;

  // Regular users can only modify their own cart
  if (req.user.role !== 'admin' && userId !== req.user.id) {
    return createResponse(res, 403, { 
      message: 'Not authorized to modify this cart'
    });
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return createResponse(res, 404, { 
      message: 'Cart not found'
    });
  }

  cart.items = [];
  await cart.save();
  
  cart = await cart.populate('user', 'name email');
  createResponse(res, 200, cart);
});
