// const Hamper = require("../models/hamperModel");
// const Product = require('../models/AddPost'); // Product model

// // Get user's hamper
// const getHamper = async (req, res) => {
//   try {
//     console.log('Getting hamper for user:', req.user._id);

//     let hamper = await Hamper.findOne({ userId: req.user._id })
//       .populate({
//         path: 'items.productId',
//         select: 'Product_name Product_price Product_image Product_category Product_available'
//       });

//     if (!hamper) {
//       console.log('No hamper found, creating new hamper');
//       hamper = await Hamper.create({ userId: req.user._id, items: [] });
//     }

//     const validItems = hamper.items.filter(item => item.productId !== null);
    
//     const totalAmount = validItems.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price && item.productId.Product_available) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Hamper fetched successfully',
//       hamper: validItems,
//       totalAmount: totalAmount,
//       totalItems: validItems.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Get Hamper Error:', err);
//     res.status(500).json({ 
//       message: 'Error fetching hamper',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Add product to hamper
// const addToHamper = async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;

//     const mongoose = require('mongoose');
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: 'Invalid product ID format' });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     if (!product.Product_available) {
//       return res.status(400).json({ message: 'Product is not available' });
//     }

//     let hamper = await Hamper.findOne({ userId: req.user._id });
//     if (!hamper) {
//       hamper = await Hamper.create({ userId: req.user._id, items: [] });
//     }

//     const existingItemIndex = hamper.items.findIndex(
//       item => item.productId.toString() === productId
//     );

//     if (existingItemIndex > -1) {
//       hamper.items[existingItemIndex].quantity += quantity;
//     } else {
//       hamper.items.push({
//         productId: productId,
//         quantity: quantity
//       });
//     }

//     await hamper.save();

//     hamper = await hamper.populate({
//       path: 'items.productId',
//       select: 'Product_name Product_price Product_image Product_category Product_available'
//     });

//     const totalAmount = hamper.items.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price && item.productId.Product_available) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Product added to hamper',
//       hamper: hamper.items,
//       totalAmount: totalAmount,
//       totalItems: hamper.items.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Add to Hamper Error:', err);
//     res.status(500).json({ 
//       message: 'Error adding to hamper',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Update hamper item quantity
// const updateHamperItem = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { quantity } = req.body;

//     if (quantity <= 0) {
//       return removeFromHamper(req, res);
//     }

//     let hamper = await Hamper.findOne({ userId: req.user._id });
//     if (!hamper) {
//       return res.status(404).json({ message: 'Hamper not found' });
//     }

//     const itemIndex = hamper.items.findIndex(
//       item => item.productId.toString() === productId
//     );

//     if (itemIndex === -1) {
//       return res.status(404).json({ message: 'Item not found in hamper' });
//     }

//     hamper.items[itemIndex].quantity = quantity;
//     await hamper.save();

//     hamper = await hamper.populate({
//       path: 'items.productId',
//       select: 'Product_name Product_price Product_image Product_category'
//     });

//     const totalAmount = hamper.items.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Hamper updated successfully',
//       hamper: hamper.items,
//       totalAmount: totalAmount,
//       totalItems: hamper.items.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Update Hamper Error:', err);
//     res.status(500).json({ 
//       message: 'Error updating hamper',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Remove product from hamper
// const removeFromHamper = async (req, res) => {
//   try {
//     const { productId } = req.params;

//     let hamper = await Hamper.findOne({ userId: req.user._id });
//     if (!hamper) {
//       return res.status(404).json({ message: 'Hamper not found' });
//     }

//     hamper.items = hamper.items.filter(item => item.productId.toString() !== productId);
//     await hamper.save();

//     hamper = await hamper.populate({
//       path: 'items.productId',
//       select: 'Product_name Product_price Product_image Product_category'
//     });

//     const totalAmount = hamper.items.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Product removed from hamper',
//       hamper: hamper.items,
//       totalAmount: totalAmount,
//       totalItems: hamper.items.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Remove from Hamper Error:', err);
//     res.status(500).json({ 
//       message: 'Error removing from hamper',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Clear hamper
// const clearHamper = async (req, res) => {
//   try {
//     let hamper = await Hamper.findOne({ userId: req.user._id });
//     if (!hamper) {
//       return res.status(404).json({ message: 'Hamper not found' });
//     }

//     hamper.items = [];
//     await hamper.save();

//     res.json({
//       message: 'Hamper cleared successfully',
//       hamper: [],
//       totalAmount: 0,
//       totalItems: 0
//     });
//   } catch (err) {
//     console.error('Clear Hamper Error:', err);
//     res.status(500).json({ 
//       message: 'Error clearing hamper',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// // Sync hamper with localStorage
// const syncHamper = async (req, res) => {
//   try {
//     const { items } = req.body;

//     if (!Array.isArray(items) || items.length === 0) {
//       let hamper = await Hamper.findOne({ userId: req.user._id })
//         .populate({
//           path: 'items.productId',
//           select: 'Product_name Product_price Product_image Product_category'
//         });

//       if (!hamper) {
//         hamper = await Hamper.create({ userId: req.user._id, items: [] });
//       }

//       return res.json({
//         message: 'No items to sync',
//         hamper: hamper.items,
//         totalAmount: 0,
//         totalItems: 0
//       });
//     }

//     let hamper = await Hamper.findOne({ userId: req.user._id });
//     if (!hamper) {
//       hamper = await Hamper.create({ userId: req.user._id, items: [] });
//     }

//     for (const localItem of items) {
//       const product = await Product.findById(localItem.id);
//       if (!product) continue;

//       const existingItemIndex = hamper.items.findIndex(
//         item => item.productId.toString() === localItem.id
//       );

//       if (existingItemIndex > -1) {
//         hamper.items[existingItemIndex].quantity += localItem.quantity || 1;
//       } else {
//         hamper.items.push({
//           productId: localItem.id,
//           quantity: localItem.quantity || 1
//         });
//       }
//     }

//     await hamper.save();

//     hamper = await hamper.populate({
//       path: 'items.productId',
//       select: 'Product_name Product_price Product_image Product_category'
//     });

//     const totalAmount = hamper.items.reduce((total, item) => {
//       if (item.productId && item.productId.Product_price) {
//         return total + (item.productId.Product_price * item.quantity);
//       }
//       return total;
//     }, 0);

//     res.json({
//       message: 'Hamper synced successfully',
//       hamper: hamper.items,
//       totalAmount: totalAmount,
//       totalItems: hamper.items.reduce((total, item) => total + item.quantity, 0)
//     });
//   } catch (err) {
//     console.error('Sync Hamper Error:', err);
//     res.status(500).json({ 
//       message: 'Error syncing hamper',
//       error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// };

// module.exports = {
//   getHamper,
//   addToHamper,
//   updateHamperItem,
//   removeFromHamper,
//   clearHamper,
//   syncHamper
// };





const Hamper = require("../models/hamperModel");
const Product = require('../models/AddPost');

// Get user's hamper
const getHamper = async (req, res) => {
  try {
    console.log('Getting hamper for user:', req.user._id);

    let hamper = await Hamper.findOne({ userId: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'Product_name Product_price Hamper_price Product_image Product_category Product_available isHamper_product'
      });

    if (!hamper) {
      console.log('No hamper found, creating new hamper');
      hamper = await Hamper.create({ userId: req.user._id, items: [] });
    }

    // Filter out items where product might be null (deleted products)
    const validItems = hamper.items.filter(item => item.productId !== null);
    
    // ✅ ENHANCEMENT: Clean up orphaned items from database
    if (validItems.length !== hamper.items.length) {
      const orphanedCount = hamper.items.length - validItems.length;
      console.log(`🧹 Cleaning up ${orphanedCount} orphaned hamper items for user ${req.user._id}`);
      
      hamper.items = validItems;
      await hamper.save();
    }

    // ✅ FIXED: Use Hamper_price for calculations since these are hamper products
    const totalAmount = validItems.reduce((total, item) => {
      if (item.productId && item.productId.Product_available) {
        // Use Hamper_price if available, otherwise fall back to Product_price
        const price = item.productId.Hamper_price || item.productId.Product_price;
        return total + (price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Hamper fetched successfully',
      hamper: validItems,
      totalAmount: totalAmount,
      totalItems: validItems.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Get Hamper Error:', err);
    res.status(500).json({ 
      message: 'Error fetching hamper',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Add product to hamper (only hamper-eligible products)
const addToHamper = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    console.log('🎁 Add to hamper request:', { productId, quantity, userId: req.user._id });

    // Validate productId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    // Verify product exists and is hamper-eligible
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.Product_available) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // ✅ ADDED: Check if product is hamper-eligible
    if (!product.isHamper_product) {
      return res.status(400).json({ 
        message: 'This product is not available for hamper building' 
      });
    }

    if (!product.Hamper_price || product.Hamper_price <= 0) {
      return res.status(400).json({ 
        message: 'This product does not have a valid hamper price' 
      });
    }

    // Find or create hamper
    let hamper = await Hamper.findOne({ userId: req.user._id });
    if (!hamper) {
      hamper = await Hamper.create({ userId: req.user._id, items: [] });
    }

    // Check if product is already in hamper
    const existingItemIndex = hamper.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product exists
      hamper.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to hamper
      hamper.items.push({
        productId: productId,
        quantity: quantity
      });
    }

    await hamper.save();

    // Return updated hamper with populated products
    hamper = await hamper.populate({
      path: 'items.productId',
      select: 'Product_name Product_price Hamper_price Product_image Product_category Product_available isHamper_product'
    });

    // ✅ FIXED: Calculate total using Hamper_price
    const totalAmount = hamper.items.reduce((total, item) => {
      if (item.productId && item.productId.Product_available) {
        const price = item.productId.Hamper_price || item.productId.Product_price;
        return total + (price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Product added to hamper',
      hamper: hamper.items,
      totalAmount: totalAmount,
      totalItems: hamper.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Add to Hamper Error:', err);
    res.status(500).json({ 
      message: 'Error adding to hamper',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Update hamper item quantity
const updateHamperItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    console.log('Updating hamper item:', { productId, quantity, userId: req.user._id });

    if (quantity <= 0) {
      return removeFromHamper(req, res);
    }

    let hamper = await Hamper.findOne({ userId: req.user._id });
    if (!hamper) {
      return res.status(404).json({ message: 'Hamper not found' });
    }

    const itemIndex = hamper.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in hamper' });
    }

    hamper.items[itemIndex].quantity = quantity;
    await hamper.save();

    // Return updated hamper
    hamper = await hamper.populate({
      path: 'items.productId',
      select: 'Product_name Product_price Hamper_price Product_image Product_category Product_available'
    });

    const totalAmount = hamper.items.reduce((total, item) => {
      if (item.productId && item.productId.Product_available) {
        const price = item.productId.Hamper_price || item.productId.Product_price;
        return total + (price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Hamper updated successfully',
      hamper: hamper.items,
      totalAmount: totalAmount,
      totalItems: hamper.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Update Hamper Error:', err);
    res.status(500).json({ 
      message: 'Error updating hamper',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Remove product from hamper
const removeFromHamper = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log('Removing from hamper:', { productId, userId: req.user._id });

    let hamper = await Hamper.findOne({ userId: req.user._id });
    if (!hamper) {
      return res.status(404).json({ message: 'Hamper not found' });
    }

    // Remove product from hamper
    hamper.items = hamper.items.filter(item => item.productId.toString() !== productId);
    await hamper.save();

    // Return updated hamper
    hamper = await hamper.populate({
      path: 'items.productId',
      select: 'Product_name Product_price Hamper_price Product_image Product_category Product_available'
    });

    const totalAmount = hamper.items.reduce((total, item) => {
      if (item.productId && item.productId.Product_available) {
        const price = item.productId.Hamper_price || item.productId.Product_price;
        return total + (price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Product removed from hamper',
      hamper: hamper.items,
      totalAmount: totalAmount,
      totalItems: hamper.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Remove from Hamper Error:', err);
    res.status(500).json({ 
      message: 'Error removing from hamper',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Clear entire hamper
const clearHamper = async (req, res) => {
  try {
    console.log('Clearing hamper for user:', req.user._id);

    let hamper = await Hamper.findOne({ userId: req.user._id });
    if (!hamper) {
      return res.status(404).json({ message: 'Hamper not found' });
    }

    hamper.items = [];
    await hamper.save();

    res.json({
      message: 'Hamper cleared successfully',
      hamper: [],
      totalAmount: 0,
      totalItems: 0
    });
  } catch (err) {
    console.error('Clear Hamper Error:', err);
    res.status(500).json({ 
      message: 'Error clearing hamper',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Sync localStorage hamper with database
const syncHamper = async (req, res) => {
  try {
    const { items } = req.body;

    console.log('Syncing hamper for user:', req.user._id, 'Items:', items);

    if (!Array.isArray(items) || items.length === 0) {
      let hamper = await Hamper.findOne({ userId: req.user._id })
        .populate({
          path: 'items.productId',
          select: 'Product_name Product_price Hamper_price Product_image Product_category Product_available'
        });

      if (!hamper) {
        hamper = await Hamper.create({ userId: req.user._id, items: [] });
      }

      return res.json({
        message: 'No items to sync',
        hamper: hamper.items,
        totalAmount: 0,
        totalItems: 0
      });
    }

    let hamper = await Hamper.findOne({ userId: req.user._id });
    if (!hamper) {
      hamper = await Hamper.create({ userId: req.user._id, items: [] });
    }

    // Process each item from localStorage
    for (const localItem of items) {
      const product = await Product.findById(localItem.id);
      if (!product || !product.Product_available || !product.isHamper_product) continue;

      const existingItemIndex = hamper.items.findIndex(
        item => item.productId.toString() === localItem.id
      );

      if (existingItemIndex > -1) {
        hamper.items[existingItemIndex].quantity += localItem.quantity || 1;
      } else {
        hamper.items.push({
          productId: localItem.id,
          quantity: localItem.quantity || 1
        });
      }
    }

    await hamper.save();

    // Return updated hamper
    hamper = await hamper.populate({
      path: 'items.productId',
      select: 'Product_name Product_price Hamper_price Product_image Product_category Product_available'
    });

    const totalAmount = hamper.items.reduce((total, item) => {
      if (item.productId && item.productId.Product_available) {
        const price = item.productId.Hamper_price || item.productId.Product_price;
        return total + (price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Hamper synced successfully',
      hamper: hamper.items,
      totalAmount: totalAmount,
      totalItems: hamper.items.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Sync Hamper Error:', err);
    res.status(500).json({ 
      message: 'Error syncing hamper',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

module.exports = {
  getHamper,
  addToHamper,
  updateHamperItem,
  removeFromHamper,
  clearHamper,
  syncHamper
};
