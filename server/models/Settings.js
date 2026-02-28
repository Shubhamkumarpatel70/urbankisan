const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    // Shipping settings
    shippingCharge: {
      type: Number,
      default: 50,
    },
    freeShippingThreshold: {
      type: Number,
      default: 499,
    },
    // Discount tiers based on order amount
    discountTiers: [
      {
        minAmount: { type: Number, required: true },
        discountPercent: { type: Number, required: true },
        label: { type: String },
      },
    ],
    // Express delivery option
    expressDeliveryCharge: {
      type: Number,
      default: 99,
    },
    expressDeliveryEnabled: {
      type: Boolean,
      default: true,
    },
    // Payment method settings
    paymentMethods: {
      cod: {
        enabled: { type: Boolean, default: true },
        label: { type: String, default: "Cash on Delivery" },
        description: { type: String, default: "Pay when you receive" },
      },
      upi: {
        enabled: { type: Boolean, default: true },
        label: { type: String, default: "UPI Payment" },
        description: { type: String, default: "GPay, PhonePe, Paytm" },
        upiId: { type: String, default: "urbankisan@upi" },
      },
      card: {
        enabled: { type: Boolean, default: true },
        label: { type: String, default: "Credit / Debit Card" },
        description: { type: String, default: "Visa, Mastercard, RuPay" },
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Settings", settingsSchema);
