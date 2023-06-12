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
        },
        OTP: {
            type: String,
            ref: "OTP",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
