const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRouter = require("./routes/userRouter");

const { connectDb } = require("./config/db");

const app = express();

app.use(express.json());
app.use(cors());
connectDb();

const PORT = process.env.PORT || 8000;

app.use("/api/auth", userRouter);

app.listen(PORT, () => console.log(`Server is running on port:${PORT}`));
