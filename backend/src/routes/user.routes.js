import { Router } from "express";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";
import { getAllUsers } from "../controllers/user.controller.js";

const router = Router();

router.get("/", authUserMiddleware, getAllUsers);

export default router;