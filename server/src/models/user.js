// const mongoose = require('mongoose');
// const { Schema } = mongoose

// const userSchema = new Schema({
//     firstName: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: [true, "Email is required"],
//         unique: true,
//         lowercase: true,
//     },
//     password: {
//         type: String,
//         required: function () {
//             return !this.googleId; 
//         },
//         minlength: 6,
//     },
//     lastName:{
//         type: String,
//         default: null,
//     },
//     phoneNo:{
//         type:Number,
//         default: null,
//     },
//     isVerified: {
//         type: Boolean,
//         default: false,
//     },
//     role: {
//         type: String,
//         enum: ["user", "admin"],
//         default: "user",
//     },
//     googleId: {
//         type: String,
//         default: null,
//     },
// } , {timestamps:true});

// const User = mongoose.model('User', userSchema);
// module.exports = User;


const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; 
        },
        minlength: 6,
    },
    phoneNo: {
        type: String, // Changed from Number to String for better handling
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: { // Add this field
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    googleId: {
        type: String,
        default: null,
    },
    // Add address fields to match your Profile component
    address: {
        street: {
            type: String,
            default: null,
        },
        city: {
            type: String,
            default: null,
        },
        state: {
            type: String,
            default: null,
        },
        pinCode: {
            type: String,
            default: null,
        },
        country: {
            type: String,
            default: 'India',
        }
    },
    // Optional: Add flat address fields for backward compatibility
    street: {
        type: String,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },
    state: {
        type: String,
        default: null,
    },
    pinCode: {
        type: String,
        default: null,
    },
    country: {
        type: String,
        default: 'India',
    },
    // Additional useful fields
    profilePicture: {
        type: String,
        default: null,
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
