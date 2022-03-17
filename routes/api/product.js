const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const auth = require("../../middleware/auth");
const formidable = require("formidable");
const fs = require("fs");
const productById = require("../../middleware/ProductById");
const { check, validationResult } = require("express-validator");

// @route   Get api/product/list
// @desc    List all products
// @access  Public
router.get("/list", auth, async (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? req.query.limit : 6;

  try {
    let products = await Product.find({})
      .select("-photo")
      .populate("category")
      .lean()
      .populate("user", "name email")
      .sort([[sortBy, order]])
      .limit(limit)
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("Invalid queries");
  }
});

// @route           POST api/product
// @desc            Create Ad
// @access          Public

router.post(
  "/",
  auth,
  [
    check("title", "Title is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("price", "Price is required").not().isEmpty(),
    check("category", "Category is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, category } = req.body;

    const user = await User.findById(req.user.id).select("-password");

    let product = new Product({
      title,
      description,
      price,
      category,
      user: user.id,
    });

    try {
      await product.save();
      res.json(product);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

// // @route           POST api/product
// // @desc            Create Ad
// // @access          Public
// router.post("/", auth, (req, res) => {
//   let form = new formidable.IncomingForm();
//   form.keepExtensions = true;

//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       return res.status(400).json({ errors: [{ msg: "Image not uploaded" }] });
//     }

//     if (!files.photo) {
//       return res.status(400).json({ errors: [{ msg: "Image is required" }] });
//     }

//     if (
//       files.photo.mimetype !== "image/jpeg" &&
//       files.photo.mimetype !== "image/jpg" &&
//       files.photo.mimetype !== "image/png"
//     ) {
//       return res
//         .status(400)
//         .json({ errors: [{ msg: "Image type not allowed" }] });
//     }

//     // Check for all fields

//     const { title, description, price, category } = fields;

//     if (!title || !description || !price || !category) {
//       return res
//         .status(400)
//         .json({ errors: [{ msg: "All fields are required" }] });
//     }

//     let product = new Product(fields);

//     if (files.photo.size > 1000000) {
//       return res
//         .status(400)
//         .json({ errors: [{ msg: "Image should be less than 1 MB in size" }] });
//     }

//     product.photo.data = fs.readFileSync(files.photo.filepath);
//     product.photo.contentType = files.photo.mimetype;

//     try {
//       await product.save();
//       product.photo = undefined;
//       res.json(product);
//     } catch (error) {
//       console.log(error);
//       res.status(500).send("Server Error");
//     }
//   });
// });

// @route           POST api/product/productId
// @desc            Get Product
// @access          Public
router.get("/:productId", productById, (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
});

// @route           POST api/product/photo/productId
// @desc            Get a Product Image
// @access          Public
router.get("/photo/:productId", productById, (req, res) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }

  res.status(400).json({ errors: [{ msg: "Failed to load image" }] });
});

// @route   Delete api/category/:categoryId
// @desc    Delete Single category
// @access  Private Admin
router.delete("/:productId", auth, productById, async (req, res) => {
  let product = req.product;
  try {
    let deletedProduct = await product.remove();
    res.json({
      message: `${deletedProduct.title} deleted successfully`,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
