
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Image upload endpoint
router.post("/upload", protect, admin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Get all products (public - only active products)
router.get("/", async (req, res) => {
  try {
    const { category, search, featured, includeInactive } = req.query;
    let query = {};

    // Only show active products for public API (unless admin requests inactive)
    if (includeInactive !== "true") {
      query.isActive = true;
    }

    if (category) query.category = category;
    if (featured) query.isFeatured = featured === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (Admin only)
router.post("/", protect, admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (Admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product (Admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Recalculate all product ratings from actual reviews (Admin only)
router.post("/recalculate-ratings", protect, admin, async (req, res) => {
  try {
    const Review = require("../models/Review");
    const products = await Product.find({});
    
    let updated = 0;
    for (const product of products) {
      const reviews = await Review.find({ product: product._id });
      
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        product.rating = Math.round(avgRating * 10) / 10;
        product.numReviews = reviews.length;
      } else {
        product.rating = 0;
        product.numReviews = 0;
      }
      
      await product.save();
      updated++;
    }
    
    res.json({ message: `Recalculated ratings for ${updated} products` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
