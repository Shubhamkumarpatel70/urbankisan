const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newsletter");
const { protect, admin } = require("../middleware/auth");

// Subscribe to newsletter (public)
router.post("/subscribe", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ message: "Email already subscribed" });
      } else {
        // Reactivate subscription
        existing.isActive = true;
        existing.subscribedAt = new Date();
        await existing.save();
        return res.json({ message: "Welcome back! Subscription reactivated" });
      }
    }

    await Newsletter.create({ email, name: name || "" });
    res.status(201).json({ message: "Successfully subscribed to newsletter" });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unsubscribe from newsletter (public)
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({ message: "Email not found" });
    }

    subscriber.isActive = false;
    await subscriber.save();
    res.json({ message: "Successfully unsubscribed from newsletter" });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all subscribers (admin only)
router.get("/", protect, admin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const subscribers = await Newsletter.find(filter).sort({
      subscribedAt: -1,
    });
    const stats = {
      total: await Newsletter.countDocuments(),
      active: await Newsletter.countDocuments({ isActive: true }),
      inactive: await Newsletter.countDocuments({ isActive: false }),
    };

    res.json({ subscribers, stats });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete subscriber (admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    res.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle subscriber status (admin only)
router.put("/:id/toggle", protect, admin, async (req, res) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    subscriber.isActive = !subscriber.isActive;
    await subscriber.save();
    res.json(subscriber);
  } catch (error) {
    console.error("Error toggling subscriber status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
