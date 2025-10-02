import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "./public"); // Folder to save files
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Create a unique filename to prevent overwriting
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // keep the original extension
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Optional: filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // accept file
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Create multer instance
const upload = multer({ storage, fileFilter });

export default upload;


