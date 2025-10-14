// const Product = require("../models/AddPost");
// const Banners = require("../models/AddBanner");
// const Category = require("../models/AddCategory");

// const getCategories = async (req, res) => {
//   try {
//     const categories = await Category.find({});
//     res.status(200).json({
//       message: "successfull",
//       categories: categories,
//     });
//   } catch (e) {
//     res.status(400).send("failed: " + e.message);
//   }
// };

// const getProducts = async (req, res) => {
//   try {
//     const {
//       search,
//       category, // this is the slug!
//       minPrice,
//       maxPrice,
//       sortBy,
//       sortOrder = "asc",
//       page = 1,
//       limit = 12,
//     } = req.query;

//     const query = {};

//     // Step 1: Search
//     if (search) {
//       query.$or = [
//         { Product_name: { $regex: search, $options: "i" } },
//         { Product_discription: { $regex: search, $options: "i" } },
//       ];
//     }

//     // ✅ Step 2: Category filtering using slug
//     if (category) {
//       const categoryDoc = await Category.findOne({ slug: category });
//       if (!categoryDoc) {
//         return res.status(400).json({ message: "Invalid category slug" });
//       }
//       query.Product_category = categoryDoc._id;
//     }

//     // Step 3: Price range
//     if (minPrice || maxPrice) {
//       query.Product_price = {};
//       if (minPrice) query.Product_price.$gte = Number(minPrice);
//       if (maxPrice) query.Product_price.$lte = Number(maxPrice);
//     }

//     // Step 4: Sorting
//     const sortOptions = {};
//     if (sortBy) {
//       sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
//     }

//     // Step 5: Pagination
//     const skip = (Number(page) - 1) * Number(limit);

//     const products = await Product.find(query)
//       .populate("Product_category") // optional
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(Number(limit));

//     const total = await Product.countDocuments(query);

//     res.status(200).json({
//       message: "successfull",
//       products,
//       pagination: {
//         total,
//         page: Number(page),
//         pages: Math.ceil(total / Number(limit)),
//       },
//     });
//   } catch (e) {
//     res.status(400).json({
//       message: "failed: " + e.message,
//     });
//   }
// };

// const getBanner = async (req, res) => {
//   try {
//     const banners = await Banners.find({});
//     res.status(200).json({
//       message: "sucessfull",
//       banners: banners,
//     });
//   } catch (e) {
//     res.status(400).json({
//       message: "failed: " + e.message,
//     });
//   }
// };

// const getAllData = async (req, res) => {
//   try {
//     const products = await Product.find({});
//     const banners = await Banners.find({});
//     const categoriesRaw = await Category.find({});

//     // Transform categories to include standardized keys
//     const categories = categoriesRaw.map(cat => ({
//       _id: cat._id,
//       name: cat.category,
//       image: cat.category_image,
//       description: cat.category_description,
//       slug: cat.category?.toLowerCase().replace(/\s+/g, "-") || cat._id.toString(),
//     }));

//     const response = {
//       products,
//       banners,
//       categories,
//     };

//     res.status(200).json({
//       message: "success",
//       data: response,
//     });
//   } catch (e) {
//     res.status(400).json({
//       message: "failed: " + e.message,
//     });
//   }
// };


// const getProductsBySlug = async (req, res) => {
//   try {
//     const { category } = req.query;

//     console.log("👉 Received category slug:", category);

//     if (!category) {
//       return res.status(400).json({ message: "Missing category slug" });
//     }

//     const categoryDoc = await Category.findOne({ slug: category });
//     console.log("✅ Found category document:", categoryDoc);

//     if (!categoryDoc) {
//       return res.status(400).json({ message: "Invalid category slug" });
//     }

//     const products = await Product.find({ Product_category: categoryDoc._id })
//       .populate("Product_category", "category category_description")
//       .lean();

//     console.log("✅ Found products:", products.length);

//     const transformed = products.map((product) => ({
//       ...product,
//       Product_category:
//         product.Product_category?.category || product.Product_category,
//     }));

//     res.status(200).json({
//       message: "Products by category fetched",
//       product: transformed,
//     });
//   } catch (e) {
//     console.error("❌ Error in getProductsBySlug:", e); // Add this!
//     res.status(500).json({ message: "Error: " + e.message });
//   }
// };

// const getProductById = async (req, res) => {
//   try {
//     const { id } = req.query;

//     if (!id) {
//       return res.status(400).json({ message: "Missing product ID" });
//     }

//     const product = await Product.findById(id).populate("Product_category");

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json({ product });
//   } catch (e) {
//     res.status(500).json({ message: "Error: " + e.message });
//   }
// };

// module.exports = {
//   getCategories,
//   getProducts,
//   getBanner,
//   getAllData,
//   getProductsBySlug, // ✅ Add this line
//   getProductById, // ✅ Add this line
// };





















const Product = require("../models/AddPost");
const Banners = require("../models/AddBanner");
const Category = require("../models/AddCategory");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({
      message: "successfull",
      categories: categories,
    });
  } catch (e) {
    res.status(400).send("failed: " + e.message);
  }
};

// ✅ FIXED: Updated getProducts with proper pagination response
// const getProducts = async (req, res) => {
//   try {
//     const {
//       search,
//       category, // this is the slug!
//       minPrice,
//       maxPrice,
//       sortBy,
//       sortOrder = "asc",
//       page = 1,
//       limit = 12, // ✅ Changed default to 12 but will be overridden by frontend
//       skip = 0,   // ✅ Added skip parameter support
//     } = req.query;

//     console.log(`🔄 Backend: getProducts called with limit=${limit}, skip=${skip}, page=${page}`);

//     const query = {};

//     // Step 1: Search
//     if (search) {
//       query.$or = [
//         { Product_name: { $regex: search, $options: "i" } },
//         { Product_discription: { $regex: search, $options: "i" } },
//       ];
//     }

//     // ✅ Step 2: Category filtering using slug
//     if (category) {
//       const categoryDoc = await Category.findOne({ slug: category });
//       if (!categoryDoc) {
//         return res.status(400).json({ message: "Invalid category slug" });
//       }
//       query.Product_category = categoryDoc._id;
//     }

//     // Step 3: Price range
//     if (minPrice || maxPrice) {
//       query.Product_price = {};
//       if (minPrice) query.Product_price.$gte = Number(minPrice);
//       if (maxPrice) query.Product_price.$lte = Number(maxPrice);
//     }

//     // Step 4: Sorting
//     const sortOptions = {};
//     if (sortBy) {
//       sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
//     }

//     // ✅ Step 5: Improved Pagination - Support both skip and page-based pagination
//     let skipValue = 0;
//     if (skip && Number(skip) > 0) {
//       // Use skip parameter if provided (for Load More functionality)
//       skipValue = Number(skip);
//     } else if (page) {
//       // Use page-based pagination as fallback
//       skipValue = (Number(page) - 1) * Number(limit);
//     }

//     console.log(`📊 Backend: Using skip=${skipValue}, limit=${limit}`);

//     const products = await Product.find(query)
//       .populate("Product_category") // optional
//       .sort(sortOptions)
//       .skip(skipValue)
//       .limit(Number(limit));

//     const total = await Product.countDocuments(query);

//     console.log(`📦 Backend: Found ${products.length} products, total: ${total}`);

//     // ✅ FIXED: Response structure that matches frontend expectations
//     res.status(200).json({
//       message: "successfull",
//       products,
//       totalProducts: total, // ✅ Frontend expects this field directly
//       hasMore: (skipValue + products.length) < total, // ✅ Helpful for frontend
//       pagination: {
//         total,
//         page: Number(page),
//         pages: Math.ceil(total / Number(limit)),
//         skip: skipValue,
//         limit: Number(limit)
//       },
//     });
//   } catch (e) {
//     console.error("❌ Backend error in getProducts:", e);
//     res.status(400).json({
//       message: "failed: " + e.message,
//     });
//   }
// };

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category, // this is the slug!
      minPrice,
      maxPrice,
      sortBy,
      sortOrder = "asc",
      page = 1,
      limit = 12,
      skip = 0,
      type // ✅ Add type parameter for hamper filtering
    } = req.query;

    console.log(`🔄 Backend: getProducts called with limit=${limit}, skip=${skip}, page=${page}, type=${type}`);

    const query = {};

    // ✅ Step 1: Hamper filtering (add this FIRST)
    if (type === 'hamper') {
      query.isHamper_product = true;
      query.Product_available = true;
      query.Hamper_price = { $gt: 0 };
      console.log('🎁 Filtering for hamper-eligible products');
    } else {
      // For regular products, just ensure they're available
      query.Product_available = true;
    }

    // Step 2: Search
    if (search) {
      query.$or = [
        { Product_name: { $regex: search, $options: "i" } },
        { Product_discription: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ Step 3: Category filtering using slug
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (!categoryDoc) {
        return res.status(400).json({ message: "Invalid category slug" });
      }
      query.Product_category = categoryDoc._id;
    }

    // Step 4: Price range (use appropriate price field for hamper products)
    if (minPrice || maxPrice) {
      const priceField = type === 'hamper' ? 'Hamper_price' : 'Product_price';
      query[priceField] = {};
      if (minPrice) query[priceField].$gte = Number(minPrice);
      if (maxPrice) query[priceField].$lte = Number(maxPrice);
    }

    // Step 5: Sorting
    const sortOptions = {};
    if (sortBy) {
      // ✅ Adjust sort field for hamper products
      let sortField = sortBy;
      if (type === 'hamper' && sortBy === 'Product_price') {
        sortField = 'Hamper_price';
      }
      sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;
    }

    // ✅ Step 6: Improved Pagination
    let skipValue = 0;
    if (skip && Number(skip) > 0) {
      skipValue = Number(skip);
    } else if (page) {
      skipValue = (Number(page) - 1) * Number(limit);
    }

    console.log(`📊 Backend: Using skip=${skipValue}, limit=${limit}, query:`, query);

    // ✅ Select appropriate fields based on product type
    let selectFields = 'Product_name Product_price Product_image Product_category Product_available';
    if (type === 'hamper') {
      selectFields += ' isHamper_product Hamper_price';
    }

    const products = await Product.find(query)
      .populate("Product_category", "category slug")
      .select(selectFields)
      .sort(sortOptions)
      .skip(skipValue)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(query);

    // ✅ Transform products for consistent response (especially for hamper products)
    const transformedProducts = products.map(product => ({
      ...product,
      Product_category_name: product.Product_category?.category || 'Uncategorized'
    }));

    console.log(`📦 Backend: Found ${products.length} products, total: ${total}`);

    // ✅ Response structure for both regular and hamper products
    res.status(200).json({
      message: "Products fetched successfully",
      product: transformedProducts, // ✅ Keep 'product' field for compatibility with existing code
      products: transformedProducts, // ✅ Also provide 'products' field
      totalProducts: total,
      hasMore: (skipValue + products.length) < total,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        skip: skipValue,
        limit: Number(limit)
      },
      // ✅ Add metadata for hamper requests
      ...(type === 'hamper' && {
        hamperProductsCount: total,
        isHamperRequest: true
      })
    });
  } catch (e) {
    console.error("❌ Backend error in getProducts:", e);
    res.status(400).json({
      message: "failed: " + e.message,
    });
  }
};


const getBanner = async (req, res) => {
  try {
    const banners = await Banners.find({});
    res.status(200).json({
      message: "sucessfull",
      banners: banners,
    });
  } catch (e) {
    res.status(400).json({
      message: "failed: " + e.message,
    });
  }
};

const getAllData = async (req, res) => {
  try {
    const products = await Product.find({});
    const banners = await Banners.find({});
    const categoriesRaw = await Category.find({});

    // Transform categories to include standardized keys
    const categories = categoriesRaw.map(cat => ({
      _id: cat._id,
      name: cat.category,
      image: cat.category_image,
      description: cat.category_description,
      slug: cat.category?.toLowerCase().replace(/\s+/g, "-") || cat._id.toString(),
    }));

    const response = {
      products,
      banners,
      categories,
    };

    res.status(200).json({
      message: "success",
      data: response,
    });
  } catch (e) {
    res.status(400).json({
      message: "failed: " + e.message,
    });
  }
}

const getProductsBySlug = async (req, res) => {
  try {
    const { category } = req.query;

    console.log("👉 Received category slug:", category);

    if (!category) {
      return res.status(400).json({ message: "Missing category slug" });
    }

    const categoryDoc = await Category.findOne({ slug: category });
    console.log("✅ Found category document:", categoryDoc);

    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category slug" });
    }

    const products = await Product.find({ Product_category: categoryDoc._id })
      .populate("Product_category", "category category_description")
      .lean();

    console.log("✅ Found products:", products.length);

    const transformed = products.map((product) => ({
      ...product,
      Product_category:
        product.Product_category?.category || product.Product_category,
    }));

    res.status(200).json({
      message: "Products by category fetched",
      product: transformed,
    });
  } catch (e) {
    console.error("❌ Error in getProductsBySlug:", e);
    res.status(500).json({ message: "Error: " + e.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Missing product ID" });
    }

    const product = await Product.findById(id).populate("Product_category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (e) {
    res.status(500).json({ message: "Error: " + e.message });
  }
}

module.exports = {
  getCategories,
  getProducts,
  getBanner,
  getAllData,
  getProductsBySlug,
  getProductById,
};