const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  image: String,
});

// Auto-incrementing counter for order IDs
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    itemsPrice: {
      type: Number,
      required: true,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "confirmed",
        "processing",
        "shipped",
        "outForDelivery",
        "delivered",
        "cancelled",
      ],
      default: "confirmed",
    },
    trackingId: {
      type: String,
      default: "",
    },
    deliveryPartner: {
      type: String,
      default: "",
    },
    deliveredAt: Date,
    // Status timestamps
    statusDates: {
      confirmed: Date,
      processing: Date,
      shipped: Date,
      outForDelivery: Date,
      delivered: Date,
      cancelled: Date,
    },
    // Payment details
    utrNumber: {
      type: String,
      default: "",
    },
    // Discount info
    discountAmount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      default: "",
    },
    discountCode: {
      type: String,
      default: "",
    },
    // Cancellation reason
    cancelReason: {
      type: String,
      default: "",
    },
    // Who cancelled the order (user or admin)
    cancelledBy: {
      type: String,
      enum: ["user", "admin", ""],
      default: "",
    },
    // Refund status for online payments
    refundStatus: {
      type: String,
      enum: ["pending", "completed", "not_required", ""],
      default: "",
    },
    refundedAt: Date,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    refundUtrNumber: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Generate unique orderId before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const counter = await Counter.findByIdAndUpdate(
      "orderId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    this.orderId = `UK-${yy}${mm}-${String(counter.seq).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
