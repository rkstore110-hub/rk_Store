const express = require('express');
const orderRouter = express.Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus
} = require('../controllers/orderController');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User routes
orderRouter.post('/create', userMiddleware, createOrder);
orderRouter.get('/user', userMiddleware, getUserOrders);
orderRouter.get('/:id', userMiddleware, getOrder);

// Admin routes
orderRouter.get('/admin/all', adminMiddleware, getAllOrders);
orderRouter.patch('/admin/:id/status', adminMiddleware, updateOrderStatus);
orderRouter.patch('/admin/:id/payment', adminMiddleware, updatePaymentStatus);

module.exports = orderRouter; 