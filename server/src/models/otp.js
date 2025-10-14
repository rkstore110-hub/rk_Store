const mongoose = require('mongoose');
const { Schema } = mongoose;

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String, // store hashed OTP
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // Expires in 10 mins
    },
})

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;
