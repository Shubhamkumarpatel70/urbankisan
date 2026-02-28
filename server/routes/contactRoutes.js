const express = require("express");
const router = express.Router();
const ContactQuery = require("../models/ContactQuery");
const { protect, admin } = require("../middleware/auth");

// Submit contact query (public)
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email and message are required" });
    }

    const query = await ContactQuery.create({
      name,
      email,
      subject: subject || "General Inquiry",
      message,
    });

    res.status(201).json({ message: "Query submitted successfully", query });
  } catch (error) {
    console.error("Error submitting contact query:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all contact queries (admin only)
router.get("/", protect, admin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const queries = await ContactQuery.find(filter).sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    console.error("Error fetching contact queries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update contact query status (admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const query = await ContactQuery.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    if (status) query.status = status;
    if (adminNotes !== undefined) query.adminNotes = adminNotes;

    await query.save();
    res.json(query);
  } catch (error) {
    console.error("Error updating contact query:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete contact query (admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const query = await ContactQuery.findByIdAndDelete(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    res.json({ message: "Query deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact query:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
