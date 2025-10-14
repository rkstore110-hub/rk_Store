const express = require('express');
const wishlistRouter = express.Router();
const {
  getWishlist,
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
  clearWishlist,
  syncWishlist
} = require('../controllers/wishlistController');
const userMiddleware = require('../middleware/userMiddleware');

// All routes require user authentication
wishlistRouter.use(userMiddleware);

// Wishlist routes
wishlistRouter.get('/', getWishlist);                          // GET /wishlist
wishlistRouter.post('/add', addToWishlist);                    // POST /wishlist/add
wishlistRouter.put('/update/:productId', updateWishlistItem);  // PUT /wishlist/update/:productId  
wishlistRouter.delete('/remove/:productId', removeFromWishlist); // DELETE /wishlist/remove/:productId
wishlistRouter.delete('/clear', clearWishlist);                // DELETE /wishlist/clear
wishlistRouter.post('/sync', syncWishlist);                    // POST /wishlist/sync

module.exports = wishlistRouter;
