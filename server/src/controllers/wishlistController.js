const Wishlist = require('../models/Wishlist');
const Product = require('../models/AddPost');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'Product_name Product_price Product_image Product_category Product_available',
        populate: {
          path: 'Product_category',
          select: 'category'
        }
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Transform for frontend compatibility
    const transformedItems = wishlist.items
      .filter(item => item.productId) // Filter out items with deleted products
      .map(item => ({
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        dateAdded: item.dateAdded
      }));

    res.json({
      message: 'Wishlist fetched successfully',
      wishlist: transformedItems
    });
  } catch (err) {
    console.error('Get Wishlist Error:', err);
    res.status(500).json({ 
      message: 'Error fetching wishlist',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate quantity
    const validQuantity = Math.max(1, Math.min(99, parseInt(quantity)));

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Check if product is already in wishlist
    const existingItemIndex = wishlist.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      wishlist.items[existingItemIndex].quantity = validQuantity;
      wishlist.items[existingItemIndex].dateAdded = new Date();
    } else {
      // Add new item to wishlist
      wishlist.items.push({
        productId,
        quantity: validQuantity,
        dateAdded: new Date()
      });
    }

    await wishlist.save();

    // Populate and return updated wishlist
    wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'Product_name Product_price Product_image Product_category Product_available',
        populate: {
          path: 'Product_category',
          select: 'category'
        }
      });

    const transformedItems = wishlist.items
      .filter(item => item.productId)
      .map(item => ({
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        dateAdded: item.dateAdded
      }));

    res.json({
      message: 'Product added to wishlist',
      wishlist: transformedItems
    });
  } catch (err) {
    console.error('Add to Wishlist Error:', err);
    res.status(500).json({ 
      message: 'Error adding to wishlist',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Update wishlist item quantity
const updateWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1 || quantity > 99) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 99' });
    }

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const itemIndex = wishlist.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    // Update quantity
    wishlist.items[itemIndex].quantity = parseInt(quantity);
    await wishlist.save();

    // Populate and return updated wishlist
    const populatedWishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'Product_name Product_price Product_image Product_category Product_available',
        populate: {
          path: 'Product_category',
          select: 'category'
        }
      });

    const transformedItems = populatedWishlist.items
      .filter(item => item.productId)
      .map(item => ({
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        dateAdded: item.dateAdded
      }));

    res.json({
      message: 'Wishlist item updated',
      wishlist: transformedItems
    });
  } catch (err) {
    console.error('Update Wishlist Error:', err);
    res.status(500).json({ 
      message: 'Error updating wishlist item',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove product from wishlist
    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId
    );
    
    await wishlist.save();

    // Populate and return updated wishlist
    const populatedWishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'Product_name Product_price Product_image Product_category Product_available',
        populate: {
          path: 'Product_category',
          select: 'category'
        }
      });

    const transformedItems = populatedWishlist.items
      .filter(item => item.productId)
      .map(item => ({
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        dateAdded: item.dateAdded
      }));

    res.json({
      message: 'Product removed from wishlist',
      wishlist: transformedItems
    });
  } catch (err) {
    console.error('Remove from Wishlist Error:', err);
    res.status(500).json({ 
      message: 'Error removing from wishlist',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      message: 'Wishlist cleared',
      wishlist: []
    });
  } catch (err) {
    console.error('Clear Wishlist Error:', err);
    res.status(500).json({ 
      message: 'Error clearing wishlist',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Sync wishlist (for login scenarios)
const syncWishlist = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Validate all products exist
    const productIds = items.map(item => item.productId).filter(Boolean);
    const existingProducts = await Product.find({ 
      _id: { $in: productIds } 
    }).select('_id');
    
    const existingProductIds = existingProducts.map(p => p._id.toString());

    // Filter out invalid products and create new items
    const validItems = items
      .filter(item => 
        item.productId && 
        existingProductIds.includes(item.productId) &&
        item.quantity >= 1 && 
        item.quantity <= 99
      )
      .map(item => ({
        productId: item.productId,
        quantity: Math.min(99, Math.max(1, parseInt(item.quantity))),
        dateAdded: item.dateAdded ? new Date(item.dateAdded) : new Date()
      }));

    // Replace wishlist items with synced items
    wishlist.items = validItems;
    await wishlist.save();

    // Populate and return updated wishlist
    const populatedWishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'Product_name Product_price Product_image Product_category Product_available',
        populate: {
          path: 'Product_category',
          select: 'category'
        }
      });

    const transformedItems = populatedWishlist.items
      .filter(item => item.productId)
      .map(item => ({
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        dateAdded: item.dateAdded
      }));

    res.json({
      message: 'Wishlist synced successfully',
      wishlist: transformedItems
    });
  } catch (err) {
    console.error('Sync Wishlist Error:', err);
    res.status(500).json({ 
      message: 'Error syncing wishlist',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
  clearWishlist,
  syncWishlist
};
