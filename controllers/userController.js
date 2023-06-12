const User = require("../models/userModel");
const { generateAccessToken } = require("../utils/jwt");
const { generateOtp } = require("../utils/otp");
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

let newUser = {
    username: "",
    number: "",
};

const signup = async (req, res) => {
    try {
        const { username, number } = req.body;
        if (!username || !number) {
            return res.status(400).json({ message: "Username and Phone number are required" });
        }
        const isExists = await User.findOne({ username: username });
        if (isExists) {
            return res.status(400).json({ message: "User already exists with username" });
        }

        newUser.number = number;
        newUser.username = username;
        // await User.create(newUser);

        const OTP = generateOtp(4);

        await client.messages
            .create({
                body: `Your OTP is : ${OTP}, please dont share it with anyone`,
                from: process.env.TWILIO_NUMBER,
                to: "+919747159584",
            })
            .then(() => res.status(200).json({ message: "OTP sent successfully" }));

        return res.status(201).json({ message: "Account created" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const verifyPhone = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(404).json({ message: "OTP is required" });
        }
        await User.create(newUser);
        const user = await User.findOne({ number: newUser.number });
        const access_token = generateAccessToken(user._id);
        res.status(200).json({
            message: "Number verified, account created",
            id: user._id,
            username: user.username,
            access_token: access_token,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const access_token = generateAccessToken(user._id);
        res.status(200).json({
            message: "Login successful",
            id: user._id,
            username: user.username,
            access_token: access_token,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { signup, login };
