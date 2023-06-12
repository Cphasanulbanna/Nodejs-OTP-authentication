const express = require("express");
const { signup, login, verifyPhoneNumber } = require("../controllers/userController");
const router = express.Router();

router.post("/signup", signup);

router.post("/signup/verify/", verifyPhoneNumber);
router.post("/login", login);

module.exports = router;
