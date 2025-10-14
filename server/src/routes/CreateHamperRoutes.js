const express = require('express');
const hamperRouter = express.Router();
const {
  getHamper,
  addToHamper,
  updateHamperItem,
  removeFromHamper,
  clearHamper,
  syncHamper
} = require('../controllers/createHamper');
const userMiddleware = require('../middleware/userMiddleware');

// All routes require user authentication
hamperRouter.use(userMiddleware);

// Get user's hamper
hamperRouter.get('/', getHamper);

// Add product to hamper
hamperRouter.post('/add', addToHamper);

// Update hamper item quantity
hamperRouter.put('/update/:productId', updateHamperItem);

// Remove product from hamper
hamperRouter.delete('/remove/:productId', removeFromHamper);

// Clear entire hamper
hamperRouter.delete('/clear', clearHamper);

// Sync localStorage hamper with database (for login)
hamperRouter.post('/sync', syncHamper);

module.exports = hamperRouter;


