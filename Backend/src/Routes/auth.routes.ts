import express, { Router } from "express";
import { login, logOut, signUp } from "../Controllers/auth.controllers";

const authRouter: Router = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", login);
authRouter.get("/logout", logOut);

export default authRouter;
