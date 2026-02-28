const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");

// Get notifications for current user (with unread count)
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({
      $or: [
        { target: "all" },
        { target: "specificUsers", targetUsers: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sentBy", "name");

    const withReadStatus = notifications.map((n) => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.readBy.some((rid) => rid.toString() === userId.toString()),
      createdAt: n.createdAt,
      sentBy: n.sentBy?.name || "Admin",
    }));

    const unreadCount = withReadStatus.filter((n) => !n.isRead).length;

    res.json({ notifications: withReadStatus, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count only (for polling — lightweight)
router.get("/unread-count", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({
      $or: [
        { target: "all" },
        { target: "specificUsers", targetUsers: userId },
      ],
      readBy: { $ne: userId },
    }).countDocuments();

    res.json({ unreadCount: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read (must come BEFORE /:id/read to avoid route conflicts)
router.put("/read-all", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      {
        $or: [
          { target: "all" },
          { target: "specificUsers", targetUsers: userId },
        ],
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } },
    );
    res.json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const userId = req.user._id;
    const alreadyRead = notification.readBy.some(
      (rid) => rid.toString() === userId.toString(),
    );

    if (!alreadyRead) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.json({ message: "Marked as read", alreadyRead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- ADMIN ROUTES ----

// Get all notifications (admin)
router.get("/all", protect, admin, async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .populate("sentBy", "name")
      .populate("targetUsers", "name email");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send notification (admin)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { title, message, type, target, targetUsers } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and message are required" });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || "info",
      target: target || "all",
      targetUsers: targetUsers || [],
      sentBy: req.user._id,
    });

    const populated = await notification.populate("sentBy", "name");

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete notification (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    await notification.deleteOne();
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
