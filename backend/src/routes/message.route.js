import { Router } from "express";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";
import { getChatMessages } from "../controllers/message.controller.js";

const router = Router();

router.get("/:chatId", authUserMiddleware, getChatMessages);

export default router;