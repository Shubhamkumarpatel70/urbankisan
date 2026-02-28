const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const { protect, admin } = require("../middleware/auth");

// Create new order
router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      saveAddress,
      utrNumber,
      discountAmount,
      discountType,
      discountCode,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      utrNumber: utrNumber || "",
      discountAmount: discountAmount || 0,
      discountType: discountType || "",
      discountCode: discountCode || "",
      statusDates: {
        confirmed: new Date(),
      },
    });

    const createdOrder = await order.save();

    // Decrease stock for each ordered item
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Save address to user profile if requested
    if (saveAddress) {
      await User.findByIdAndUpdate(req.user._id, {
        address: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          phone: shippingAddress.phone,
        },
      });
    }

    // Send order confirmation notification
    try {
      await Notification.create({
        title: "🎉 Order Confirmed!",
        message: `Your order ${createdOrder.orderId || createdOrder._id} of ₹${createdOrder.totalPrice} has been placed successfully. We'll update you as it progresses!`,
        type: "order",
        target: "specificUsers",
        targetUsers: [req.user._id],
        sentBy: req.user._id,
      });
    } catch (e) {
      /* ignore notification errors */
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get logged in user orders
router.get("/myorders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order stats (Admin only)
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalCustomers = await User.countDocuments({ isAdmin: false });
    const Product = require("../models/Product");
    const totalProducts = await Product.countDocuments();

    res.json({
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public order tracking - returns limited info for non-owners
router.get("/track/:id", async (req, res) => {
  try {
    // Try orderId first (UK-XXXX-XXXX), then MongoDB _id
    let order;
    if (req.params.id.startsWith("UK-")) {
      order = await Order.findOne({ orderId: req.params.id });
    } else {
      order = await Order.findById(req.params.id);
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authenticated and is the owner
    let isOwner = false;
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isOwner = order.user.toString() === decoded.id;
      } catch (e) {
        // Token invalid, treat as non-owner
      }
    }

    // Return limited info for non-owners
    if (!isOwner) {
      return res.json({
        orderId: order.orderId || order._id,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
        trackingId: order.trackingId,
        deliveryPartner: order.deliveryPartner,
        isOwner: false,
      });
    }

    // Return full info for owner
    res.json({
      ...order.toObject(),
      isOwner: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID or orderId
router.get("/:id", protect, async (req, res) => {
  try {
    // Try orderId first (UK-XXXX-XXXX), then MongoDB _id
    let order;
    if (req.params.id.startsWith("UK-")) {
      order = await Order.findOne({ orderId: req.params.id }).populate(
        "user",
        "name email",
      );
    } else {
      order = await Order.findById(req.params.id).populate(
        "user",
        "name email",
      );
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Admin only)
router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User cancel their own order
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order can be cancelled (only confirmed or processing status)
    if (!["confirmed", "processing"].includes(order.orderStatus)) {
      return res.status(400).json({ 
        message: "Order cannot be cancelled at this stage" 
      });
    }

    const { cancelReason } = req.body;
    if (!cancelReason || !cancelReason.trim()) {
      return res.status(400).json({ message: "Please provide a cancellation reason" });
    }

    order.orderStatus = "cancelled";
    order.cancelReason = cancelReason.trim();
    order.cancelledBy = "user";
    
    // Set refund status based on payment method
    if (order.paymentMethod !== "COD" && order.paymentMethod !== "Cash on Delivery") {
      order.refundStatus = "pending";
    } else {
      order.refundStatus = "not_required";
    }

    // Track status date
    if (!order.statusDates) {
      order.statusDates = {};
    }
    order.statusDates.cancelled = new Date();
    order.markModified('statusDates');

    // Restore stock for cancelled order items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    const updatedOrder = await order.save();

    // Send notification to user
    try {
      await Notification.create({
        title: "📦 Order Cancelled",
        message: `Your order ${updatedOrder.orderId || updatedOrder._id} has been cancelled. ${order.refundStatus === "pending" ? "Refund will be processed within 5-7 business days." : ""}`,
        type: "order",
        target: "specificUsers",
        targetUsers: [order.user],
        sentBy: order.user,
      });
    } catch (e) { /* ignore */ }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status (Admin only)
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.orderStatus;
    const newStatus = req.body.orderStatus;
    order.orderStatus = newStatus;

    // Track status date
    if (!order.statusDates) {
      order.statusDates = {};
    }
    order.statusDates[newStatus] = new Date();
    order.markModified('statusDates');

    // Handle tracking info when status changes to processing or beyond
    if (req.body.trackingId) {
      order.trackingId = req.body.trackingId;
    }
    if (req.body.deliveryPartner) {
      order.deliveryPartner = req.body.deliveryPartner;
    }

    if (newStatus === "delivered") {
      order.deliveredAt = Date.now();
    }

    // Handle cancellation - restore stock only if not previously cancelled
    if (newStatus === "cancelled" && previousStatus !== "cancelled") {
      if (req.body.cancelReason) {
        order.cancelReason = req.body.cancelReason;
      }
      order.cancelledBy = "admin";
      // Set refund status based on payment method
      if (order.paymentMethod !== "COD" && order.paymentMethod !== "Cash on Delivery") {
        order.refundStatus = "pending";
      } else {
        order.refundStatus = "not_required";
      }
      // Restore stock for cancelled order items
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    const updatedOrder = await order.save();

    // Send status update notification to user
    const statusMessages = {
      processing: "📦 Your order is being processed",
      shipped: "🚚 Your order has been shipped",
      outForDelivery: "🛵 Your order is out for delivery",
      delivered: "✅ Your order has been delivered",
      cancelled: "❌ Your order has been cancelled",
    };
    const msg = statusMessages[req.body.orderStatus];
    if (msg) {
      try {
        let notifMessage = `Order ${updatedOrder.orderId || updatedOrder._id} — ${msg.slice(2)}.`;

        // Add tracking info to notification
        if (req.body.trackingId && req.body.deliveryPartner) {
          notifMessage += ` Track via ${req.body.deliveryPartner} (ID: ${req.body.trackingId}).`;
        }

        // Add cancellation reason to notification
        if (req.body.orderStatus === "cancelled" && req.body.cancelReason) {
          notifMessage += ` Reason: ${req.body.cancelReason}.`;
        }

        notifMessage +=
          req.body.orderStatus === "delivered"
            ? " Thank you for shopping with UrbanKisan!"
            : req.body.orderStatus === "cancelled"
              ? " Contact support for any queries."
              : " Track your order for live updates.";

        await Notification.create({
          title: msg,
          message: notifMessage,
          type: "order",
          target: "specificUsers",
          targetUsers: [order.user],
          sentBy: req.user._id,
        });
      } catch (e) {
        /* ignore */
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin mark refund as completed
router.put("/:id/refund", protect, admin, async (req, res) => {
  try {
    const { refundUtrNumber } = req.body;

    if (!refundUtrNumber || !refundUtrNumber.trim()) {
      return res.status(400).json({ message: "Please provide refund UTR number" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "cancelled") {
      return res.status(400).json({ message: "Order is not cancelled" });
    }

    if (order.refundStatus !== "pending") {
      return res.status(400).json({ message: "Refund is not pending for this order" });
    }

    order.refundStatus = "completed";
    order.refundedAt = new Date();
    order.refundedBy = req.user._id;
    order.refundUtrNumber = refundUtrNumber.trim();

    const updatedOrder = await order.save();

    // Send notification to user
    try {
      await Notification.create({
        title: "💰 Refund Processed",
        message: `Refund of ₹${order.totalPrice} for order ${order.orderId || order._id} has been processed. UTR: ${refundUtrNumber.trim()}. Amount will be credited within 3-5 business days.`,
        type: "order",
        target: "specificUsers",
        targetUsers: [order.user],
        sentBy: req.user._id,
      });
    } catch (e) { /* ignore */ }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
