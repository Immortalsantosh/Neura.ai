import jwt from "jsonwebtoken";

const genToken = (userId: string): string => {
  try {
    const token = jwt.sign( { userId }, process.env.JWT_SECRET as string,{ expiresIn: "10d" }
    );
    return token;
  } catch (error) {
    console.error(error);
    throw new Error("Token generation failed");
  }
};

export default genToken;
