const express = require("express");
const { signup, login, verifyPhoneNumber, resendOtp } = require("../controllers/userController");
const router = express.Router();

router.post("/signup", signup);

router.post("/signup/verify/", verifyPhoneNumber);
router.post("/login", login);
router.post("/resend-otp", resendOtp);

module.exports = router;
