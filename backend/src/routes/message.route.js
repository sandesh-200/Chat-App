import { Router } from "express";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";
import {
  deleteMessage,
  getChatMessages,
} from "../controllers/message.controller.js";

const router = Router();

router.get("/:chatId", authUserMiddleware, getChatMessages);
router.delete("/:messageId", authUserMiddleware, deleteMessage);

export default router;
