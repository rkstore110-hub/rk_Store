const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddCategory = new Schema({
  category: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  category_image: {
    type: String,
    required: true, 
  },
  category_description: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 500,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  }
}, {
  strict: true,
  collection: 'categories',
});

const Category = mongoose.model('Category', AddCategory);
module.exports = Category;