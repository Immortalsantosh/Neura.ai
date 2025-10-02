import express, { Router } from "express";
import { getCurrentUser } from "../Controllers/user.controllers";
import isAuth from "../Middlewares/isAuth";
import { updateAssistant } from "../Controllers/user.controllers";
import upload from "../Middlewares/multer";
import { askToAssistant } from "../Controllers/user.controllers";

const userRouter: Router = express.Router();

userRouter.get("/current",isAuth,getCurrentUser)
userRouter.post("/update",isAuth,upload.single("assistantImage"),updateAssistant)
userRouter.post("/asktoassistant",isAuth,askToAssistant)

export default userRouter;
