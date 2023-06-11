const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLenght: 2,
    },
    password: {
        type: String,
        required: true,
        minLenght: 6,
    },
});

module.exports = mongoose.model("User", userSchema);
