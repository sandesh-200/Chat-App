import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";

const router = Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/logout", logoutUser);
export default router;