import { Router } from "express";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";
import { getAllUsers, getMe } from "../controllers/user.controller.js";

const router = Router();

router.get("/", authUserMiddleware, getAllUsers);
router.get("/me",authUserMiddleware,getMe)

export default router;