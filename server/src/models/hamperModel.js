// // new added by soham - Cart model for tracking user's shopping cart items
// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const HamperSchema = new Schema({
//   productId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Products', // Change to 'Products' to match your model registration
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   }
// });

// const cartSchema = new Schema({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   items: [HamperSchema],
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Update the updatedAt timestamp on every save
// cartSchema.pre('save', function(next) {
//   this.updatedAt = new Date();
//   next();
// });

// const Hamper = mongoose.model('Hamper', HamperSchema);
// module.exports = Hamper;



const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the hamper item schema (subdocument)
const hamperItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Products',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

// Define the main hamper schema
const hamperSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [hamperItemSchema], // ✅ This creates the items.productId path
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp on every save
hamperSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// ✅ Export the correct main hamper model
const Hamper = mongoose.model('Hamper', hamperSchema);
module.exports = Hamper;
