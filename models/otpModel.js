const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        otp: {
            type: String,
            min: 4,
            max: 4,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("OTP", otpSchema);
