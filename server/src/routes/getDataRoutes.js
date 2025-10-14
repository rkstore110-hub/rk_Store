const express = require("express");
const data = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const {
  getCategories,
  getProducts,
  getBanner,
  getAllData,
  getProductsBySlug,
  getProductById,
} = require("../controllers/getData");

data.get("/getcategories", getCategories);
data.get("/getproducts", getProducts);
data.get("/getbanners", getBanner);
data.get("/getAlldata", getAllData);
// In getDataRoutes.js
data.get("/getproductsbycategory", getProductsBySlug);
data.get("/getproductbyid", getProductById);




module.exports = data;
