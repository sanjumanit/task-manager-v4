import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { summaryReport } from "../controllers/taskController.js";
const router = Router();

router.get("/summary", authMiddleware, summaryReport);

export default router;
