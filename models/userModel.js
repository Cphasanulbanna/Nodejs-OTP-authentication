const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            minLenght: 2,
        },
        number: {
            type: String,
            min: 7,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            minLenght: 4,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        attempts: {
            type: Number,
            default: 0,
        },
        lastAttempt: {
            type: Date,
        },
        otp: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OTP",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
