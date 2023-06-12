const generateOtp = (count) => {
    let digits = "0123456789";
    let otp = "";
    for (let i = 0; i < count; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

module.exports = { generateOtp };
