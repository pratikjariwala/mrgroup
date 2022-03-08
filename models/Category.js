const mongoose = require("mongoose"); //Placing mongoose package in a variable mongoose

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    maxLength: 32,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

//Exporting the category schema to reuse
module.exports = mongoose.model("Category", CategorySchema);
