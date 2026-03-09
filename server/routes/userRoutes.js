const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/auth");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google OAuth login/register
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    // Decode the JWT token from Google (the credential is a JWT)
    const base64Url = credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, "base64")
        .toString()
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const { sub: googleId, email, name, picture } = JSON.parse(jsonPayload);

    // Check if user exists with this Google ID or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId if user exists with email but no googleId
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

// Forgot Password - Generate reset token
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    // Check if user signed up with Google only
    if (user.googleId && !user.password) {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please login with Google.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and save to user
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // In production, you would send an email here
    // For now, we'll return the token (in production, never do this!)
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    // TODO: Send email with resetUrl
    // For development, log the URL
    console.log("Password reset URL:", resetUrl);

    res.json({
      message: "Password reset link has been sent to your email",
      // Remove this in production - only for testing
      ...(process.env.NODE_ENV !== "production" && { resetToken, resetUrl }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
});

// Reset Password - Verify token and update password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Hash the token from URL
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// Verify reset token (check if token is valid)
router.get("/reset-password/:token", async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ valid: false, message: "Invalid or expired reset token" });
    }

    res.json({ valid: true, email: user.email });
  } catch (error) {
    res.status(500).json({ valid: false, message: "Error verifying token" });
  }
});

// Check if email exists - returns user info for direct password reset
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    // Check if user signed up with Google only
    if (user.googleId && !user.password) {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please login with Google.",
      });
    }

    res.json({
      found: true,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking email" });
  }
});

// Direct password reset - reset password using email
router.post("/direct-reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    user.password = password;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Direct reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// Get user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.address) {
        user.address = req.body.address;
      }
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        address: updatedUser.address,
        token: generateToken(updatedUser._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users (Admin only)
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    // Get order counts for each user
    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        const orders = await Order.find({ user: user._id });
        const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        return {
          ...user.toObject(),
          orderCount,
          totalSpent,
        };
      }),
    );

    res.json(usersWithOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
