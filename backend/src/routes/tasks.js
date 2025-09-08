import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createTask, listTasks, updateTaskStatus, getTaskHistory, reassignTask } from "../controllers/taskController.js";

const router = Router();
router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, listTasks);
router.put("/:id/status", authMiddleware, updateTaskStatus);
router.put("/:id/reassign", authMiddleware, reassignTask);
router.get("/:id/history", authMiddleware, getTaskHistory);

export default router;
