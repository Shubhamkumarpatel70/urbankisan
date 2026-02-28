const express = require("express");
const router = express.Router();
const Team = require("../models/Team");

const { protect, admin } = require("../middleware/auth");
const path = require("path");
const upload = require("../middleware/upload");

// Image upload endpoint
router.post("/upload", protect, admin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Return the relative URL for the uploaded image
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Get all active team members (public)
router.get("/", async (req, res) => {
  try {
    const team = await Team.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all team members (admin)
router.get("/all", protect, admin, async (req, res) => {
  try {
    const team = await Team.find().sort({ order: 1, createdAt: -1 });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single team member
router.get("/:id", async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create team member (admin)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, role, image, bio, order, socialLinks } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    const member = new Team({
      name,
      role,
      image: image || "https://via.placeholder.com/150",
      bio: bio || "",
      order: order || 0,
      socialLinks: socialLinks || {},
    });

    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update team member (admin)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, role, image, bio, order, isActive, socialLinks } = req.body;

    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    if (name) member.name = name;
    if (role) member.role = role;
    if (image !== undefined) member.image = image;
    if (bio !== undefined) member.bio = bio;
    if (order !== undefined) member.order = order;
    if (isActive !== undefined) member.isActive = isActive;
    if (socialLinks)
      member.socialLinks = { ...member.socialLinks, ...socialLinks };

    const updatedMember = await member.save();
    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete team member (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: "Team member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle active status (admin)
router.patch("/:id/toggle", protect, admin, async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    member.isActive = !member.isActive;
    const updatedMember = await member.save();
    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reorder team members (admin)
router.put("/reorder/batch", protect, admin, async (req, res) => {
  try {
    const { orders } = req.body; // [{ id: 'xxx', order: 0 }, ...]

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: "Orders array is required" });
    }

    const updates = orders.map(({ id, order }) =>
      Team.findByIdAndUpdate(id, { order }, { new: true }),
    );

    await Promise.all(updates);
    res.json({ message: "Team members reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
