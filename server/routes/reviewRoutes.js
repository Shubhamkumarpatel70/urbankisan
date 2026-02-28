const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/auth");

// Create a review
router.post("/", protect, async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    // Check if order exists and is delivered
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (order.orderStatus !== "delivered") {
      return res
        .status(400)
        .json({ message: "Can only review delivered orders" });
    }

    // Check if product is in the order
    const orderItem = order.items.find(
      (item) => item.product.toString() === productId,
    );
    if (!orderItem) {
      return res.status(400).json({ message: "Product not in this order" });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: orderId,
    });
    if (existingReview) {
      return res.status(400).json({ message: "Already reviewed this product" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating,
      comment,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name")
      .populate("product", "name image");

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already reviewed this product" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if user can review a product (has delivered order with this product)
router.get("/can-review/:productId", protect, async (req, res) => {
  try {
    const deliveredOrders = await Order.find({
      user: req.user._id,
      orderStatus: "delivered",
      "items.product": req.params.productId,
    });

    const reviewableOrders = [];
    for (const order of deliveredOrders) {
      const existingReview = await Review.findOne({
        user: req.user._id,
        product: req.params.productId,
        order: order._id,
      });
      if (!existingReview) {
        reviewableOrders.push({
          orderId: order._id,
          orderNumber: order.orderId || order._id,
          deliveredAt: order.deliveredAt || order.updatedAt,
        });
      }
    }

    res.json({
      canReview: reviewableOrders.length > 0,
      orders: reviewableOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's review for a specific product/order
router.get("/user-review/:orderId/:productId", protect, async (req, res) => {
  try {
    const review = await Review.findOne({
      user: req.user._id,
      order: req.params.orderId,
      product: req.params.productId,
    });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a review
router.put("/:id", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name")
      .populate("product", "name image");

    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews (Admin)
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const { rating, sort } = req.query;

    let filter = {};
    if (rating) {
      filter.rating = Number(rating);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "rating-high") sortOption = { rating: -1 };
    if (sort === "rating-low") sortOption = { rating: 1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .populate("product", "name image")
      .populate("order", "orderId")
      .sort(sortOption);

    // Stats
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      reviews,
      stats: stats[0] || {
        totalReviews: 0,
        avgRating: 0,
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        twoStar: 0,
        oneStar: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a review (Admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    const productId = review.product;
    await review.deleteOne();

    // Recalculate rating
    await Review.calculateAverageRating(productId);

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upvote a review
router.post("/:id/upvote", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const userId = req.user._id;
    const hasUpvoted = review.upvotes.includes(userId);
    const hasDownvoted = review.downvotes.includes(userId);

    if (hasUpvoted) {
      // Remove upvote (toggle off)
      review.upvotes = review.upvotes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      // Add upvote
      review.upvotes.push(userId);
      // Remove downvote if exists
      if (hasDownvoted) {
        review.downvotes = review.downvotes.filter(
          (id) => id.toString() !== userId.toString(),
        );
      }
    }

    await review.save();
    res.json({
      upvotes: review.upvotes.length,
      downvotes: review.downvotes.length,
      userUpvoted: review.upvotes.includes(userId),
      userDownvoted: review.downvotes.includes(userId),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Downvote a review
router.post("/:id/downvote", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const userId = req.user._id;
    const hasUpvoted = review.upvotes.includes(userId);
    const hasDownvoted = review.downvotes.includes(userId);

    if (hasDownvoted) {
      // Remove downvote (toggle off)
      review.downvotes = review.downvotes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      // Add downvote
      review.downvotes.push(userId);
      // Remove upvote if exists
      if (hasUpvoted) {
        review.upvotes = review.upvotes.filter(
          (id) => id.toString() !== userId.toString(),
        );
      }
    }

    await review.save();
    res.json({
      upvotes: review.upvotes.length,
      downvotes: review.downvotes.length,
      userUpvoted: review.upvotes.includes(userId),
      userDownvoted: review.downvotes.includes(userId),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all votes (Admin)
router.get("/admin/votes", protect, admin, async (req, res) => {
  try {
    const { productId, voteType } = req.query;

    let matchStage = {
      $or: [
        { upvotes: { $exists: true, $ne: [] } },
        { downvotes: { $exists: true, $ne: [] } },
      ],
    };

    if (productId) {
      matchStage.product = new (require("mongoose").Types.ObjectId)(productId);
    }

    const reviews = await Review.find(matchStage)
      .populate("user", "name email")
      .populate("product", "name image")
      .populate("upvotes", "name email")
      .populate("downvotes", "name email")
      .sort({ createdAt: -1 });

    // Format votes
    let allVotes = [];
    for (const review of reviews) {
      for (const voter of review.upvotes) {
        allVotes.push({
          reviewId: review._id,
          product: review.product,
          reviewer: review.user,
          voter: voter,
          voteType: "upvote",
          reviewRating: review.rating,
          reviewComment: review.comment,
          createdAt: review.updatedAt,
        });
      }
      for (const voter of review.downvotes) {
        allVotes.push({
          reviewId: review._id,
          product: review.product,
          reviewer: review.user,
          voter: voter,
          voteType: "downvote",
          reviewRating: review.rating,
          reviewComment: review.comment,
          createdAt: review.updatedAt,
        });
      }
    }

    // Filter by vote type if specified
    if (voteType === "upvote" || voteType === "downvote") {
      allVotes = allVotes.filter((v) => v.voteType === voteType);
    }

    // Stats
    const totalUpvotes = allVotes.filter((v) => v.voteType === "upvote").length;
    const totalDownvotes = allVotes.filter(
      (v) => v.voteType === "downvote",
    ).length;

    res.json({
      votes: allVotes,
      stats: {
        total: allVotes.length,
        upvotes: totalUpvotes,
        downvotes: totalDownvotes,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
