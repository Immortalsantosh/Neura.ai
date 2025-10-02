
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./Config/db";
import authRouter from "./Routes/auth.routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./Routes/user.routes";
dotenv.config();

const app = express();
app.use(cors({
    origin: "https://neura-ai-4-keln.onrender.com", // frontend url
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    connectDB(process.env.MONGODB_URL!);
  console.log(`🚀 Server is running on port ${PORT}`);
});
