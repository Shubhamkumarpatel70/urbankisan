const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    bio: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      email: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Team", teamSchema);
