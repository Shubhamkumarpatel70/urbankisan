const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      unique: true,
    },
    // Editable fields (can be different from original review)
    text: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: "India",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
