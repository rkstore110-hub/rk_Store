// const Cart = require('../models/Cart');
// const Product = require('../models/AddPost'); // This import name should match your file name
// const Hamper = require("../models/hamperModel")

// // Get user's cart
// const getCart = async (req, res) => {
//   try {
//     console.log('Getting cart for user:', req.user._id);

//     let cart = await Cart.findOne({ userId: req.user._id })
//       .populate({
//         path: 'items.productId',
//         select: 'Product_name Product_price Product_image Product_category Product_available'
//       });

//     if (!cart) {
//       console.log('No cart found, creating new cart');
//       cart = await Cart.create({ userId: req.user._id, items: [] });
//     }

//     // Filter out items where product might be null (deleted products)
//     const validItems = cart.items.filter(item => item.productId !== null);
    
//     // Calculate total amount
//     const totalAmount = validItems.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price && item.productId.Product_available) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Cart fetched successfully',
//       cart: validItems,
//       totalAmount: totalAmount,
//       totalItems: validItems.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Get Cart Error:', err);
//     res.status(500).json({ 
//       message: 'Error fetching cart',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Add product to cart
// const addToCart = async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;

//      console.log('🔍 Add to cart request:', { productId, quantity, userId: req.user._id });
//     console.log('🔍 Request body:', req.body);
//     console.log('🔍 User:', req.user)

//     // Validate productId format
//     const mongoose = require('mongoose');
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: 'Invalid product ID format' });
//     }

//     // Verify product exists and is available
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     if (!product.Product_available) {
//       return res.status(400).json({ message: 'Product is not available' });
//     }

//     // Find or create cart
//     let cart = await Cart.findOne({ userId: req.user._id });
//     if (!cart) {
//       cart = await Cart.create({ userId: req.user._id, items: [] });
//     }

//     // Check if product is already in cart
//     const existingItemIndex = cart.items.findIndex(
//       item => item.productId.toString() === productId
//     );

//     if (existingItemIndex > -1) {
//       // Update quantity if product exists
//       cart.items[existingItemIndex].quantity += quantity;
//     } else {
//       // Add new product to cart
//       cart.items.push({
//         productId: productId,
//         quantity: quantity
//       });
//     }

//     await cart.save();

//     // Return updated cart with populated products
//     cart = await cart.populate({
//       path: 'items.productId',
//       select: 'Product_name Product_price Product_image Product_category Product_available'
//     });

//     // Calculate total amount (only for available products)
//     const totalAmount = cart.items.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price && item.productId.Product_available) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Product added to cart',
//       cart: cart.items,
//       totalAmount: totalAmount,
//       totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Add to Cart Error:', err);
//     res.status(500).json({ 
//       message: 'Error adding to cart',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Update cart item quantity
// const updateCartItem = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { quantity } = req.body;

//     console.log('Updating cart item:', { productId, quantity, userId: req.user._id }); // Debug log

//     if (quantity <= 0) {
//       return removeFromCart(req, res);
//     }

//     // Find cart
//     let cart = await Cart.findOne({ userId: req.user._id });
//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }

//     // Find and update item
//     const itemIndex = cart.items.findIndex(
//       item => item.productId.toString() === productId
//     );

//     if (itemIndex === -1) {
//       return res.status(404).json({ message: 'Item not found in cart' });
//     }

//     cart.items[itemIndex].quantity = quantity;
//     await cart.save();

//     // Return updated cart
//     cart = await cart.populate({
//       path: 'items.productId',
//       select: 'Product_name Product_price Product_image Product_category'
//     });

//     // Calculate total amount
//     const totalAmount = cart.items.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Cart updated successfully',
//       cart: cart.items,
//       totalAmount: totalAmount,
//       totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Update Cart Error:', err);
//     res.status(500).json({ 
//       message: 'Error updating cart',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Remove product from cart
// const removeFromCart = async (req, res) => {
//   try {
//     const { productId } = req.params;

//     console.log('Removing from cart:', { productId, userId: req.user._id }); // Debug log

//     // Find cart
//     let cart = await Cart.findOne({ userId: req.user._id });
//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }

//     // Remove product from cart
//     cart.items = cart.items.filter(item => item.productId.toString() !== productId);
//     await cart.save();

//     // Return updated cart
//     cart = await cart.populate({
//       path: 'items.productId',
//       select: 'Product_name Product_price Product_image Product_category'
//     });

//     // Calculate total amount
//     const totalAmount = cart.items.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Product removed from cart',
//       cart: cart.items,
//       totalAmount: totalAmount,
//       totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Remove from Cart Error:', err);
//     res.status(500).json({ 
//       message: 'Error removing from cart',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Clear entire cart
// const clearCart = async (req, res) => {
//   try {
//     console.log('Clearing cart for user:', req.user._id); // Debug log

//     let cart = await Cart.findOne({ userId: req.user._id });
//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }

//     cart.items = [];
//     await cart.save();

//     res.json({
//       message: 'Cart cleared successfully',
//       cart: [],
//       totalAmount: 0,
//       totalItems: 0
//     });
//   } catch (err) {
//     console.error('Clear Cart Error:', err);
//     res.status(500).json({ 
//       message: 'Error clearing cart',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Sync localStorage cart with database (for login sync)
// const syncCart = async (req, res) => {
//   try {
//     const { items } = req.body; // Array of items from localStorage

//     console.log('Syncing cart for user:', req.user._id, 'Items:', items); // Debug log

//     if (!Array.isArray(items) || items.length === 0) {
//       // Still return current cart even if no items to sync
//       let cart = await Cart.findOne({ userId: req.user._id })
//         .populate({
//           path: 'items.productId',
//           select: 'Product_name Product_price Product_image Product_category'
//         });

//       if (!cart) {
//         cart = await Cart.create({ userId: req.user._id, items: [] });
//       }

//       return res.json({
//         message: 'No items to sync',
//         cart: cart.items,
//         totalAmount: 0,
//         totalItems: 0
//       });
//     }

//     // Find or create cart
//     let cart = await Cart.findOne({ userId: req.user._id });
//     if (!cart) {
//       cart = await Cart.create({ userId: req.user._id, items: [] });
//     }

//     // Process each item from localStorage
//     for (const localItem of items) {
//       // Verify product exists
//       const product = await Product.findById(localItem.id);
//       if (!product) continue;

//       // Check if item already exists in database cart
//       const existingItemIndex = cart.items.findIndex(
//         item => item.productId.toString() === localItem.id
//       );

//       if (existingItemIndex > -1) {
//         // Merge quantities (you can adjust this logic as needed)
//         cart.items[existingItemIndex].quantity += localItem.quantity || 1;
//       } else {
//         // Add new item
//         cart.items.push({
//           productId: localItem.id,
//           quantity: localItem.quantity || 1
//         });
//       }
//     }

//     await cart.save();

//     // Return updated cart
//     cart = await cart.populate({
//       path: 'items.productId',
//       select: 'Product_name Product_price Product_image Product_category'
//     });

//     // Calculate total amount
//     const totalAmount = cart.items.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Cart synced successfully',
//       cart: cart.items,
//       totalAmount: totalAmount,
//       totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Sync Cart Error:', err);
//     res.status(500).json({ 
//       message: 'Error syncing cart',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// module.exports = {
//   getCart,
//   addToCart,
//   updateCartItem,
//   removeFromCart,
//   clearCart,
//   syncCart
// };






















const Cart = require('../models/Cart');
const Product = require('../models/AddPost');

// Get user's cart (normal products only)
const getCart = async (req, res) => {
  try {
    console.log('Getting cart for user:', req.user._id);

    let cart = await Cart.findOne({ userId: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'Product_name Product_price Product_image Product_category Product_available'
      });

    if (!cart) {
      console.log('No cart found, creating new cart');
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    // Filter out items where product might be null (deleted products)
    const validItems = cart.items.filter(item => item.productId !== null);
    
    // Calculate total amount
    const totalAmount = validItems.reduce((total, item) => {
      if (item.productId && item.productId.Product_price && item.productId.Product_available) {
        return total + (item.productId.Product_price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Cart fetched successfully',
      cart: validItems,
      totalAmount: totalAmount,
      totalItems: validItems.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Get Cart Error:', err);
    res.status(500).json({ 
      message: 'Error fetching cart',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Add product to cart (normal products only)
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    console.log('🔍 Add to cart request:', { productId, quantity, userId: req.user._id });

    // Validate productId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    // Verify product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.Product_available) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Allow hamper-eligible products in the normal cart at regular price
if (product.isHamper_product) {
  // If the request tries to add using the regular price, allow.
  // If (optional) you pass price in body, check it!
  if (req.body.price && Number(req.body.price) !== Number(product.Product_price)) {
    return res.status(400).json({
      message: 'Hamper products must be added through the custom hamper builder'
    });
  }
  // If not passing price, you may trust that if it's the /cart/add endpoint, add at normal price
  // You could remove the blocker entirely.
}


    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    // Check if product is already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      cart.items.push({
        productId: productId,
        quantity: quantity
      });
    }

    await cart.save();

    // Return updated cart with populated products
    cart = await cart.populate({
      path: 'items.productId',
      select: 'Product_name Product_price Product_image Product_category Product_available'
    });

    // Calculate total amount (only for available products)
    const totalAmount = cart.items.reduce((total, item) => {
      if (item.productId && item.productId.Product_price && item.productId.Product_available) {
        return total + (item.productId.Product_price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Product added to cart',
      cart: cart.items,
      totalAmount: totalAmount,
      totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Add to Cart Error:', err);
    res.status(500).json({ 
      message: 'Error adding to cart',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    console.log('Updating cart item:', { productId, quantity, userId: req.user._id });

    if (quantity <= 0) {
      return removeFromCart(req, res);
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Return updated cart
    cart = await cart.populate({
      path: 'items.productId',
      select: 'Product_name Product_price Product_image Product_category Product_available'
    });

    const totalAmount = cart.items.reduce((total, item) => {
      if (item.productId && item.productId.Product_price && item.productId.Product_available) {
        return total + (item.productId.Product_price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Cart updated successfully',
      cart: cart.items,
      totalAmount: totalAmount,
      totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Update Cart Error:', err);
    res.status(500).json({ 
      message: 'Error updating cart',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Remove product from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log('Removing from cart:', { productId, userId: req.user._id });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    // Return updated cart
    cart = await cart.populate({
      path: 'items.productId',
      select: 'Product_name Product_price Product_image Product_category Product_available'
    });

    const totalAmount = cart.items.reduce((total, item) => {
      if (item.productId && item.productId.Product_price && item.productId.Product_available) {
        return total + (item.productId.Product_price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Product removed from cart',
      cart: cart.items,
      totalAmount: totalAmount,
      totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Remove from Cart Error:', err);
    res.status(500).json({ 
      message: 'Error removing from cart',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    console.log('Clearing cart for user:', req.user._id);

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: 'Cart cleared successfully',
      cart: [],
      totalAmount: 0,
      totalItems: 0
    });
  } catch (err) {
    console.error('Clear Cart Error:', err);
    res.status(500).json({ 
      message: 'Error clearing cart',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Sync localStorage cart with database
const syncCart = async (req, res) => {
  try {
    const { items } = req.body;

    console.log('Syncing cart for user:', req.user._id, 'Items:', items);

    if (!Array.isArray(items) || items.length === 0) {
      let cart = await Cart.findOne({ userId: req.user._id })
        .populate({
          path: 'items.productId',
          select: 'Product_name Product_price Product_image Product_category Product_available'
        });

      if (!cart) {
        cart = await Cart.create({ userId: req.user._id, items: [] });
      }

      return res.json({
        message: 'No items to sync',
        cart: cart.items,
        totalAmount: 0,
        totalItems: 0
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    // Process each item from localStorage
    for (const localItem of items) {
      const product = await Product.findById(localItem.id);
      if (!product || !product.Product_available) continue;

      // ✅ Skip hamper products during sync
      if (product.isHamper_product) {
        console.log('Skipping hamper product during sync:', product.Product_name);
        continue;
      }

      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === localItem.id
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += localItem.quantity || 1;
      } else {
        cart.items.push({
          productId: localItem.id,
          quantity: localItem.quantity || 1
        });
      }
    }

    await cart.save();

    // Return updated cart
    cart = await cart.populate({
      path: 'items.productId',
      select: 'Product_name Product_price Product_image Product_category Product_available'
    });

    const totalAmount = cart.items.reduce((total, item) => {
      if (item.productId && item.productId.Product_price && item.productId.Product_available) {
        return total + (item.productId.Product_price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Cart synced successfully',
      cart: cart.items,
      totalAmount: totalAmount,
      totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Sync Cart Error:', err);
    res.status(500).json({ 
      message: 'Error syncing cart',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};
