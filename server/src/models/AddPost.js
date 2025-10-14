const mongoose = require("mongoose");
const { Schema } = mongoose;

const AddPostSchema = new Schema(
  {
    Product_name: {
      type: String,
      minLenth: 2,
      maxLenth: 200,
      required: true,
    },
    Product_discription: {
      type: String,
      minLenth: 10,
      required: true,
    },
    Product_price: {
      type: Number,
      min: 10,
      max: 100000,
      required: true,
    },
    Product_image: [
      {
        type: String,
      },
    ],
    Product_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    Product_available: {
      type: Boolean,
      default: true,
      required: true,
    },
    Product_public_id: {
      type: String,
      required: true,
    },
    Product_slug: {
      type: String, 
      index: true,
    }
  },
  {
    timestamps: true,
    strict: true,
  }
);

const Product = mongoose.model("Products", AddPostSchema);
module.exports = Product;
