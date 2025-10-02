import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// 1. Extend Request type to include userId
interface AuthRequest extends Request {
  userId?: string;
}

// 2. Define expected payload inside JWT
interface TokenPayload extends JwtPayload {
  userId: string;
}

const isAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(400).json({ message: "token not found" });
    }

    // 3. Verify token
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;

    // 4. Attach userId to request
    req.userId = verifyToken.userId;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "is Auth error" });
  }
};

export default isAuth;
