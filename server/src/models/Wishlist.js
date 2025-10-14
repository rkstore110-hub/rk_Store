const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 99
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // This creates the index automatically
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true
});


// Keep only the performance index that doesn't conflict
wishlistSchema.index({ 'items.productId': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
