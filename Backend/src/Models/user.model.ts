import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    assistantName: {
      type: String,
      default: "My Assistant",
    },
    assistantImage: {
      type: String,
      default: "",
    },
    history: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Infer types from schema
type UserType = InferSchemaType<typeof userSchema>;

// Create model
const User = model<UserType>("User", userSchema);

export default User;
