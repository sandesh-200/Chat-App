import { Router } from "express";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";
import { suggestReply } from "../controllers/ai.controller.js";

const router = Router();

router.post("/suggest-reply", authUserMiddleware, suggestReply);

export default router;
