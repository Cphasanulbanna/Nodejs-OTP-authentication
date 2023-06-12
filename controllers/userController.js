//modules
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

//models
const User = require("../models/userModel");
const OTP = require("../models/otpModel");

//functions
const { generateAccessToken } = require("../utils/jwt");
const { generateOtp } = require("../utils/otp");
const { generatePasswordHash } = require("../utils/bcrypt");

const signup = async (req, res) => {
    try {
        const { username, number, password } = req.body;
        if (!username || !number || !password) {
            return res
                .status(400)
                .json({ message: "Username, password and Phone number are required" });
        }
        const isExists = await User.findOne({ username: username });
        if (isExists) {
            return res.status(400).json({ message: "User already exists with username" });
        }

        const otp = generateOtp(4);
        const newOtp = await OTP.create({ otp: otp });

        const passwordHash = await generatePasswordHash(password);
        const newUser = {
            username: username,
            password: passwordHash,
            number: number,
            otp: newOtp._id,
        };

        console.log(otp, " generated otp");

        await User.create(newUser);

        await client.messages
            .create({
                body: `Your OTP is : ${otp}, please dont share it with anyone`,
                from: process.env.TWILIO_NUMBER,
                to: `+91${number}`,
            })
            .then(() => res.status(200).json({ message: "OTP sent successfully" }));

        return res.status(201).json({ message: "Account created" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const verifyPhoneNumber = async (req, res) => {
    try {
        const { otp, number } = req.body;
        if (!otp) {
            return res.status(404).json({ message: "OTP is required" });
        }

        if (!number) {
            return res.status(404).json({ message: "phone number is required" });
        }

        const user = await User.findOne({ number: number }).populate("otp");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(user, "user");
        console.log(otp, "eneterd otp");
        console.log(user.otp.otp, "db otp");

        if (otp !== user.otp.otp) {
            return res.status(400).json({ message: "invalid OTP" });
        }

        user.isActive = true;
        await user.save();

        return res.status(200).json({ message: "Account created" });
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

module.exports = { signup, verifyPhoneNumber, login };
