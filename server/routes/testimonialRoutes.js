const express = require("express");
const router = express.Router();
const Testimonial = require("../models/Testimonial");
const Review = require("../models/Review");
const { protect, admin } = require("../middleware/auth");

// Get all active testimonials for homepage (public)
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      isActive: true,
      review: { $exists: true, $ne: null },
    })
      .populate({
        path: "review",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({ order: 1, createdAt: -1 });

    // Format response for frontend - filter out any with missing review data
    const formatted = testimonials
      .filter((t) => t.review)
      .map((t) => ({
        _id: t._id,
        name: t.review?.user?.name || "Customer",
        location: t.location,
        text: t.text,
        rating: t.review?.rating || 5,
        isActive: t.isActive,
      }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get eligible reviews (4-5 stars) not yet added as testimonials (admin only)
router.get("/eligible-reviews", protect, admin, async (req, res) => {
  try {
    // Get all review IDs that are already testimonials
    const existingTestimonials = await Testimonial.find({
      review: { $exists: true, $ne: null },
    }).select("review");

    const testimonialReviewIds = existingTestimonials
      .map((t) => t.review)
      .filter((id) => id); // Filter out any null/undefined

    // Get reviews with rating 4-5 that are not testimonials
    const eligibleReviews = await Review.find({
      rating: { $gte: 4 },
      ...(testimonialReviewIds.length > 0 && {
        _id: { $nin: testimonialReviewIds },
      }),
    })
      .populate("user", "name email")
      .populate("product", "name image")
      .sort({ createdAt: -1 });

    res.json(eligibleReviews);
  } catch (error) {
    console.error("Error in eligible-reviews:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all testimonials with review details (admin only)
router.get("/all", protect, admin, async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      review: { $exists: true, $ne: null },
    })
      .populate({
        path: "review",
        populate: [
          { path: "user", select: "name email" },
          { path: "product", select: "name image" },
        ],
      })
      .sort({ order: 1, createdAt: -1 });

    // Filter out any testimonials where review population failed
    const validTestimonials = testimonials.filter((t) => t.review);
    res.json(validTestimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create testimonial from review (admin only)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { reviewId, text, location, isActive, order } = req.body;

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if testimonial already exists for this review
    const existing = await Testimonial.findOne({ review: reviewId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Testimonial already exists for this review" });
    }

    const testimonial = await Testimonial.create({
      review: reviewId,
      text: text || review.comment,
      location: location || "India",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    const populated = await Testimonial.findById(testimonial._id).populate({
      path: "review",
      populate: [
        { path: "user", select: "name email" },
        { path: "product", select: "name image" },
      ],
    });

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Testimonial already exists for this review" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update testimonial (admin only) - only updates testimonial fields, not original review
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { text, location, isActive, order } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { text, location, isActive, order },
      { new: true },
    ).populate({
      path: "review",
      populate: [
        { path: "user", select: "name email" },
        { path: "product", select: "name image" },
      ],
    });

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle testimonial active status (admin only)
router.patch("/:id/toggle", protect, admin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();

    const populated = await Testimonial.findById(testimonial._id).populate({
      path: "review",
      populate: [
        { path: "user", select: "name email" },
        { path: "product", select: "name image" },
      ],
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete testimonial (admin only) - doesn't delete the original review
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
