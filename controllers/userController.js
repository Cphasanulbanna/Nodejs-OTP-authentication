const signup = async (req, res) => {
    try {
        return res.status(201).json({ message: "Account created" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { signup };
