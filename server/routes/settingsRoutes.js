const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const { protect, admin } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Get homepage banner and our story images (public)
router.get("/images", async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "images" });
    if (!settings) {
      settings = await Settings.create({ key: "images" });
    }
    res.json({
      homeBanner: settings.homeBanner || "",
      ourStory: settings.ourStory || "",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: upload home banner image
router.post(
  "/images/homeBanner",
  protect,
  admin,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    let settings = await Settings.findOne({ key: "images" });
    if (!settings) settings = new Settings({ key: "images" });
    settings.homeBanner = `/uploads/${req.file.filename}`;
    await settings.save();
    res.json({ url: settings.homeBanner });
  },
);

// Admin: upload our story image
router.post(
  "/images/ourStory",
  protect,
  admin,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    let settings = await Settings.findOne({ key: "images" });
    if (!settings) settings = new Settings({ key: "images" });
    settings.ourStory = `/uploads/${req.file.filename}`;
    await settings.save();
    res.json({ url: settings.ourStory });
  },
);

// Get shipping settings (public)
router.get("/shipping", async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "shipping" });

    // Create default settings if not exists
    if (!settings) {
      settings = await Settings.create({
        key: "shipping",
        shippingCharge: 50,
        freeShippingThreshold: 499,
        discountTiers: [
          {
            minAmount: 999,
            discountPercent: 5,
            label: "5% off on orders above ₹999",
          },
          {
            minAmount: 1999,
            discountPercent: 10,
            label: "10% off on orders above ₹1999",
          },
        ],
        expressDeliveryCharge: 99,
        expressDeliveryEnabled: true,
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update shipping settings (Admin only)
router.put("/shipping", protect, admin, async (req, res) => {
  try {
    const {
      shippingCharge,
      freeShippingThreshold,
      discountTiers,
      expressDeliveryCharge,
      expressDeliveryEnabled,
    } = req.body;

    let settings = await Settings.findOne({ key: "shipping" });

    if (!settings) {
      settings = new Settings({ key: "shipping" });
    }

    if (shippingCharge !== undefined) settings.shippingCharge = shippingCharge;
    if (freeShippingThreshold !== undefined)
      settings.freeShippingThreshold = freeShippingThreshold;
    if (discountTiers !== undefined) settings.discountTiers = discountTiers;
    if (expressDeliveryCharge !== undefined)
      settings.expressDeliveryCharge = expressDeliveryCharge;
    if (expressDeliveryEnabled !== undefined)
      settings.expressDeliveryEnabled = expressDeliveryEnabled;

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment methods settings (public)
router.get("/payment-methods", async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "shipping" });

    // Create default settings if not exists
    if (!settings) {
      settings = await Settings.create({
        key: "shipping",
        paymentMethods: {
          cod: {
            enabled: true,
            label: "Cash on Delivery",
            description: "Pay when you receive",
          },
          upi: {
            enabled: true,
            label: "UPI Payment",
            description: "GPay, PhonePe, Paytm",
            upiId: "urbankisan@upi",
          },
          card: {
            enabled: true,
            label: "Credit / Debit Card",
            description: "Visa, Mastercard, RuPay",
          },
        },
      });
    }

    // Return only payment methods
    res.json({
      paymentMethods: settings.paymentMethods || {
        cod: {
          enabled: true,
          label: "Cash on Delivery",
          description: "Pay when you receive",
        },
        upi: {
          enabled: true,
          label: "UPI Payment",
          description: "GPay, PhonePe, Paytm",
          upiId: "urbankisan@upi",
        },
        card: {
          enabled: true,
          label: "Credit / Debit Card",
          description: "Visa, Mastercard, RuPay",
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update payment methods settings (Admin only)
router.put("/payment-methods", protect, admin, async (req, res) => {
  try {
    const { paymentMethods } = req.body;

    let settings = await Settings.findOne({ key: "shipping" });

    if (!settings) {
      settings = new Settings({ key: "shipping" });
    }

    if (paymentMethods) {
      settings.paymentMethods = paymentMethods;
    }

    await settings.save();
    res.json({ paymentMethods: settings.paymentMethods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
