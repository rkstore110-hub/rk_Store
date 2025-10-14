const express = require('express');
// 1. ✅ Router ka naam change kiya (Standard naming convention ke liye)
const RazorpayRouter = express.Router(); 

// 2. ✅ Controller file ka naam Cashfreegetway se Razorpaygetway kar diya
//    (Aapko apne folder structure mein file ka naam bhi update karna hoga)
const { 
    createOrder, 
    verifyPayment, 
    getUserOrders, 
    handleWebhook,
} = require('../controllers/Razorpaygetway');
const userMiddleware = require('../middleware/userMiddleware');

// ----------------------------------------------------------------------
// Payment routes (Endpoints ko Razorpay style mein update kiya)

// 3. ✅ '/create' ko '/create-order' kiya (Jo backend controller mein use hua hai)
RazorpayRouter.post('/create-order', userMiddleware, createOrder);       

// 3. ✅ '/verify' ko '/verify-payment' kiya (Frontend se final check)
RazorpayRouter.post('/verify-payment', userMiddleware, verifyPayment); 

// 🚨 NOTE: Razorpay mein 'verify-callback' ki zaroorat nahi hoti, 
//          kyunki verification/update client side success handler ke through ya webhook ke through hota hai.
//          Maine isko simple rakha hai, sirf final verification /verify-payment se hoga.

// Order fetching route (Yeh same rahega)
RazorpayRouter.get('/my-orders/:userId', userMiddleware, getUserOrders); 

// 3. ✅ '/webhook' route (Razorpay Webhook notifications receive karne ke liye)
RazorpayRouter.post('/webhook', handleWebhook); 

// ----------------------------------------------------------------------

// Module export update kiya
module.exports = RazorpayRouter;