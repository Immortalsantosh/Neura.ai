import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary and returns the secure URL.
 * @param filePath - Path of the file to upload
 * @returns Promise<string> - Secure URL of the uploaded file
 */
const uploadOnCloudinary = async (filePath: string): Promise<string> => {
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath);

    // Remove the file from local storage after upload
    fs.unlinkSync(filePath);

    return uploadResult.secure_url;
  } catch (error) {
    // Remove the file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("Cloudinary upload error:", error);
    throw new Error("Cloudinary upload failed");
  }
};

export default uploadOnCloudinary;
