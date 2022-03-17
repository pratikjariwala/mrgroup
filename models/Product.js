const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  price: {
    type: Number,
    trim: true,
    required: true,
    maxlength: 32,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  sold: {
    type: Number,
    default: 0,
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
  location: {
    required: false,
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Product", productSchema);
