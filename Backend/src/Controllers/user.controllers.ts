import { Request, Response } from "express";
import User from "../Models/user.model";
import uploadOnCloudinary from "../Config/cloudinary";
import geminiResponse from "../gemini";
import moment from "moment";

// Extend Request type to include `userId`
interface AuthRequest extends Request {
  userId?: string;
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  userId?: string;
}

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAssistant = async (req: MulterRequest, res: Response): Promise<Response> => {
  try {
    const { assistantName, imageUrl } = req.body;
    
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Use uploaded file if provided, otherwise use imageUrl from body
    let assistantImage: string | undefined;
    
    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else if (imageUrl) {
      assistantImage = imageUrl;
    }

    if (!assistantImage) {
      return res.status(400).json({ message: "Assistant image is required" });
    }

    const updateData: any = {};
    if (assistantName) updateData.assistantName = assistantName;
    if (assistantImage) updateData.assistantImage = assistantImage;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Update assistant error:", error);
    return res.status(500).json({ message: "Failed to update assistant" });
  }
};

// ---------------- Gemini Assistant ----------------
type GeminiType =
  | "general"
  | "google-search"
  | "youtube-search"
  | "youtube-play"
  | "youtube-open"
  | "get-time"
  | "get-date"
  | "get-day"
  | "get-month"
  | "calculator-open"
  | "instagram-open"
  | "facebook-open"
  | "weather-show";
   

interface GeminiResult {
  type: GeminiType;
  userInput: string;
  response: string;
}

export const askToAssistant = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Authorization check
    if (!req.userId) {
      return res.status(401).json({ 
        type: "general",
        userInput: "",
        response: "Unauthorized access" 
      });
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        type: "general",
        userInput: "",
        response: "User not found" 
      });
    }

    // Validate command
    const { command } = req.body;
    if (!command || typeof command !== "string" || command.trim() === "") {
      return res.status(400).json({ 
        type: "general",
        userInput: "",
        response: "Please provide a valid command" 
      });
    }

    // Save command to history
    try {
      user.history.push(command);
      await user.save();
    } catch (historyError) {
      console.error("Error saving history:", historyError);
      // Continue even if history save fails
    }

    // Get response from Gemini
    const result = await geminiResponse(command, user.assistantName || "Assistant", user.name || "User");

    // Handle no result from Gemini
    if (!result) {
      return res.status(500).json({ 
        type: "general",
        userInput: command,
        response: "Sorry, I couldn't process your request. Please try again." 
      });
    }

    // Extract and validate response fields
    const { type, userInput, response } = result;

    if (!type || !response) {
      console.error("Invalid Gemini response structure:", result);
      return res.status(500).json({ 
        type: "general",
        userInput: command,
        response: "I received an invalid response. Please try again." 
      });
    }

    // Handle date/time commands with dynamic values
    const dateTimeMap: Record<string, string> = {
      "get-date": `Current date is ${moment().format("MMMM Do, YYYY")}`,
      "get-time": `Current time is ${moment().format("h:mm A")}`,
      "get-day": `Today is ${moment().format("dddd")}`,
      "get-month": `Current month is ${moment().format("MMMM")}`,
    };

    if (type in dateTimeMap) {
      return res.status(200).json({ 
        type, 
        userInput: userInput || command, 
        response: dateTimeMap[type] 
      });
    }

    // Valid action types
    const validTypes: GeminiType[] = [
      "general",
      "google-search",
      "youtube-search",
      "youtube-play",
      "calculator-open",
      "instagram-open",
      "facebook-open",
      "weather-show",
      "youtube-open" // included for completeness
    ];

    // Return response if type is valid
    if (validTypes.includes(type as GeminiType)) {
      return res.status(200).json({ 
        type, 
        userInput: userInput || command, 
        response 
      });
    }

    // Fallback for unknown/invalid type
    console.warn("Unknown command type received:", type);
    return res.status(200).json({ 
      type: "general",
      userInput: userInput || command,
      response: response || "I'm not sure how to help with that." 
    });

  } catch (error) {
    console.error("askToAssistant error:", error);
    
    // Return user-friendly error
    return res.status(500).json({ 
      type: "general",
      userInput: req.body.command || "",
      response: "An error occurred while processing your request. Please try again." 
    });
  }
};