const express = require('express');
const numberVerifyrouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware")
const { sendOtp, verifyOtp ,  CheckphoneNo } = require("../controllers/NumberVerification")


numberVerifyrouter.post('/send', userMiddleware, sendOtp);     
numberVerifyrouter.post('/verify', userMiddleware , verifyOtp); 
numberVerifyrouter.post('/check-phone',userMiddleware, CheckphoneNo)

module.exports = numberVerifyrouter;