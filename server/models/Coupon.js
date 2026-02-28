const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["percent", "flat"],
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: 1,
        },
        minOrder: {
            type: Number,
            default: 0,
        },
        maxDiscount: {
            type: Number,
            default: null,
        },
        // Targeting
        target: {
            type: String,
            enum: ["all", "newUsers", "specificUsers"],
            default: "all",
        },
        category: {
            type: String,
            enum: ["general", "festival", "welcome", "seasonal", "clearance", "loyalty"],
            default: "general",
        },
        targetUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        description: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        usageLimit: {
            type: Number,
            default: null,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
