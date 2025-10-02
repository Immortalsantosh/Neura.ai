import { Request, Response } from "express";
import genToken from "../Config/token";
import User from "../Models/user.model";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

// ------------------- SIGNUP -------------------
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password }: { name: string; email: string; password: string } = req.body;

    const existEmail = await User.findOne({ email });
    if (existEmail) {
      res.status(400).json({ message: "Email already exists!" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Convert ObjectId to string for JWT
    const token = genToken((user._id as Types.ObjectId).toString());

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true, // set true if HTTPS
    });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: `Sign up error: ${error.message}` });
  }
};

// ------------------- LOGIN -------------------
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Email does not exist!" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Incorrect password!" });
      return;
    }

    const token = genToken((user._id as Types.ObjectId).toString());

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: `Login error: ${error.message}` });
  }
};

// ------------------- LOGOUT -------------------
export const logOut = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ message: `Logout error: ${error.message}` });
  }
};
