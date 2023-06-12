//modules
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const moment = require("moment");

//models
const User = require("../models/userModel");
const OTP = require("../models/otpModel");

//functions
const { generateAccessToken } = require("../utils/jwt");
const { generateOtp } = require("../utils/otp");
const { generatePasswordHash, comparePassword } = require("../utils/bcrypt");

const signup = async (req, res) => {
    try {
        const { username, number, password } = req.body;
        if (!username || !number || !password) {
            return res
                .status(400)
                .json({ message: "Username, password and Phone number are required" });
        }
        const isExists = await User.findOne({ number: number });
        if (isExists) {
            return res.status(400).json({ message: "User already exists with this number" });
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

const resendOtp = async (req, res) => {
    try {
        const { number } = req.body;
        if (!number) {
            return res.status(400).json({ message: "phone number is required" });
        }

        const user = await User.findOne({ number: number });

        if (user.resendOtpSentCount >= 3) {
            return res
                .status(400)
                .json({ message: "OTP limit exceeded. Please try again after 10 minutes." });
        }

        const otp = generateOtp(4);
        const newOtp = await OTP.create({ otp: otp });
        user.otp = newOtp._id;
        user.resendOtpSentCount++;
        await user.save();
        await client.messages
            .create({
                body: `Your OTP is : ${otp}, please dont share it with anyone`,
                from: process.env.TWILIO_NUMBER,
                to: `+91${number}`,
            })
            .then(() => res.status(200).json({ message: "OTP sent successfully" }));
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

        // Check if the user has exceeded the OTP entering limit
        if (user.attempts >= 4) {
            // Calculate the time difference between the last attempt and the current time
            const lastAttemptTime = moment(user.lastAttempt);
            const currentTime = moment();
            const timeDiffMinutes = currentTime.diff(lastAttemptTime, "minutes");

            // Check if the waiting period of 10 minutes has passed
            if (timeDiffMinutes < 10) {
                return res.status(400).json({
                    message: "OTP entering limit exceeded. Please try again after 10 minutes.",
                });
            } else {
                // Reset the attempts and lastAttempt fields
                user.attempts = 0;
                user.lastAttempt = null;
                await user.save();
            }
        }

        if (otp !== user.otp.otp) {
            // Increment the attempts counter and update the lastAttempt field
            user.attempts++;
            user.lastAttempt = moment();
            await user.save();
            return res.status(400).json({ message: "invalid OTP" });
        }

        // Reset the attempts and lastAttempt fields after successful verification
        user.attempts = 0;
        user.lastAttempt = null;
        user.isActive = true;
        await OTP.findByIdAndDelete(user.otp._id);
        await user.save();

        return res.status(200).json({ message: "Account created" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { number, password } = req.body;
        if (!number) {
            return res.status(400).json({ message: "phone number is required" });
        }
        if (!password) {
            return res.status(400).json({ message: "password is required" });
        }
        const user = await User.findOne({ number: number });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const access_token = generateAccessToken(user._id);
        res.status(200).json({
            message: "Login successful",
            id: user._id,
            username: user.username,
            phone_number: user.number,
            access_token: access_token,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { signup, verifyPhoneNumber, login, resendOtp };
