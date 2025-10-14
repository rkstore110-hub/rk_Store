const express = require('express');
const cartRouter = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} = require('../controllers/cartController');
const userMiddleware = require('../middleware/userMiddleware');

// All routes require user authentication
cartRouter.use(userMiddleware);

// Get user's cart
cartRouter.get('/', getCart);

// Add product to cart
cartRouter.post('/add', addToCart);

// Update cart item quantity
cartRouter.put('/update/:productId', updateCartItem);

// Remove product from cart
cartRouter.delete('/remove/:productId', removeFromCart);

// Clear entire cart
cartRouter.delete('/clear', clearCart);

// Sync localStorage cart with database (for login)
cartRouter.post('/sync', syncCart);

module.exports = cartRouter;
