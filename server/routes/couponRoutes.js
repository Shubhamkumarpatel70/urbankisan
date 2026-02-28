const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");

// Validate a coupon (user applies coupon at checkout)
router.post("/validate", protect, async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: "Invalid coupon code" });
        }
        if (!coupon.isActive) {
            return res.status(400).json({ message: "This coupon is no longer active" });
        }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return res.status(400).json({ message: "This coupon has expired" });
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "This coupon has reached its usage limit" });
        }
        if (cartTotal < coupon.minOrder) {
            return res.status(400).json({
                message: `Minimum order of ₹${coupon.minOrder} required for this coupon`,
            });
        }

        // Check targeting
        if (coupon.target === "newUsers") {
            const orderCount = await Order.countDocuments({ user: req.user._id });
            if (orderCount > 0) {
                return res.status(400).json({ message: "This coupon is only for new users" });
            }
        }

        if (coupon.target === "specificUsers") {
            const isTargeted = coupon.targetUsers.some(
                (uid) => uid.toString() === req.user._id.toString()
            );
            if (!isTargeted) {
                return res.status(400).json({ message: "This coupon is not available for your account" });
            }
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === "percent") {
            discount = Math.round((cartTotal * coupon.value) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.value;
        }

        const label = coupon.type === "percent" ? `${coupon.value}% off` : `₹${coupon.value} off`;

        res.json({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrder: coupon.minOrder,
            maxDiscount: coupon.maxDiscount,
            category: coupon.category,
            description: coupon.description,
            label,
            discount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all active coupons visible to this user
router.get("/active", protect, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments({ user: req.user._id });
        const isNewUser = orderCount === 0;

        const coupons = await Coupon.find({
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } },
            ],
        }).select("code type value minOrder maxDiscount target category description targetUsers");

        // Filter by targeting
        const visible = coupons.filter((c) => {
            if (c.target === "all") return true;
            if (c.target === "newUsers") return isNewUser;
            if (c.target === "specificUsers") {
                return c.targetUsers.some((uid) => uid.toString() === req.user._id.toString());
            }
            return false;
        });

        res.json(visible);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ---- ADMIN ROUTES ----

// Get all coupons (admin)
router.get("/", protect, admin, async (req, res) => {
    try {
        const coupons = await Coupon.find({})
            .populate("targetUsers", "name email")
            .sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get users list for targeting (admin)
router.get("/users", protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select("name email").sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create coupon (admin)
router.post("/", protect, admin, async (req, res) => {
    try {
        const { code, type, value, minOrder, maxDiscount, isActive, expiresAt, usageLimit, target, category, targetUsers, description } = req.body;

        const exists = await Coupon.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            type,
            value,
            minOrder: minOrder || 0,
            maxDiscount: maxDiscount || null,
            isActive: isActive !== undefined ? isActive : true,
            expiresAt: expiresAt || null,
            usageLimit: usageLimit || null,
            target: target || "all",
            category: category || "general",
            targetUsers: targetUsers || [],
            description: description || "",
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update coupon (admin)
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        const fields = ["code", "type", "value", "minOrder", "maxDiscount", "isActive", "expiresAt", "usageLimit", "target", "category", "targetUsers", "description"];
        fields.forEach((f) => {
            if (req.body[f] !== undefined) {
                coupon[f] = req.body[f];
            }
        });

        const updated = await coupon.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete coupon (admin)
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        await coupon.deleteOne();
        res.json({ message: "Coupon deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
