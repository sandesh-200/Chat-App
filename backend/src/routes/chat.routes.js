import { Router } from "express";
import { createGroupChat, createPersonalChat, getSingleChat, getUserChats } from "../controllers/chat.controller.js";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/personal", authUserMiddleware, createPersonalChat);
router.post("/group",authUserMiddleware, createGroupChat);
router.get("/",authUserMiddleware, getUserChats);
router.get("/:chatId",authUserMiddleware, getSingleChat);

export default router;