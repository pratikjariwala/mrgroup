const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const auth = require("../../middleware/auth");
const adminAuth = require("../../middleware/adminAuth");
const { check, validationResult } = require("express-validator");
const categoryById = require("../../middleware/categoryById");
const formidable = require("formidable");
const fs = require("fs");

// @route           POST api/category
// @desc            Create Category
// @access          Private Admin
router.post("/", auth, adminAuth, async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Image could not be uploaded" }] });
    }

    const { name } = fields;

    if (!name) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Category name is required" }] });
    }

    try {
      let category = await Category.findOne({ name });

      if (category) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Category already exists" }] });
      }

      const newCategory = new Category({ name });

      if (files.photo) {
        if (
          files.photo.mimetype !== "image/jpeg" &&
          files.photo.mimetype !== "image/jpg" &&
          files.photo.mimetype !== "image/png"
        ) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Image type not allowed" }] });
        }

        if (files.photo.size > 1000000) {
          return res.status(400).json({
            errors: [{ msg: "Image should be less than 1MB in size" }],
          });
        }
        newCategory.photo.data = fs.readFileSync(files.photo.filepath);
        newCategory.photo.contentType = files.photo.mimetype;
      }
      category = await newCategory.save();
      category.photo = undefined;
      res.json(category);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  });
});

// // @route           POST api/category
// // @desc            Create Category
// // @access          Private Admin
// router.post(
//   "/",
//   [check("name", "Name is required").trim().not().isEmpty()],
//   auth,
//   adminAuth,
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     try {
//       const { name } = req.body;

//       let category = await Category.findOne({ name });

//       if (category) {
//         return res
//           .status(400)
//           .json({ errors: [{ msg: "Category already exists" }] });
//       }

//       const newCategory = new Category({ name });
//       category = await newCategory.save();
//       res.json(category);
//     } catch (error) {
//       res.status(500).send("Server Error");
//       console.error(error);
//     }
//   }
// );

// @route   Get api/category/all
// @desc    Get all categories
// @access  Public
router.get("/all", async (req, res) => {
  try {
    let data = await Category.find({});
    data.forEach((category) => (category.photo = undefined));
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

// @route   Get api/category/all
// @desc    Get all categories photos
// @access  Public
router.get("/photo/all", async (req, res) => {
  try {
    let data = await Category.find({});
    // res.set("Content-Type", req.cs.photo.contentType);
    let final = data.map((category) => {
      console.log(Object.keys(category));
      // if (category.photo.data != null) {
      //   return category.photo.data;
      // }
    });
    // console.log(final);
    res.send("done");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

// @route   Get api/categoryId/photo/:categoryId
// @desc    Get Single category photo
// @access  Public
router.get("/photo/:categoryId", categoryById, async (req, res) => {
  try {
    if (req.category.photo.data) {
      res.set("Content-Type", req.category.photo.contentType);
      return res.send(req.category.photo.data);
    }
    res.status(400).json({ errors: [{ msg: "Failed to load image" }] });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

// @route   Get api/category/:categoryId
// @desc    Get Single category
// @access  Public
router.get("/:categoryId", categoryById, async (req, res) => {
  res.json(req.category);
});

// @route   Put api/category/:categoryId
// @desc    Update Single category
// @access  Private Admin
router.put("/:categoryId", auth, adminAuth, categoryById, async (req, res) => {
  let category = req.category;
  const { name } = req.body;
  if (name) category.name = name.trim();

  try {
    category = await category.save();
    res.json(category);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

// @route   Delete api/category/:categoryId
// @desc    Delete Single category
// @access  Private Admin
router.delete(
  "/:categoryId",
  auth,
  adminAuth,
  categoryById,
  async (req, res) => {
    let category = req.category;
    try {
      let deletedCategory = await category.remove();
      res.json({
        message: `${deletedCategory.name} deleted successfully`,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
