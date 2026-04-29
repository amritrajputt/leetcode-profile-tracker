import type { Router } from "express";
import express from "express";
import { validateMiddleware } from "../../common/middleware/validate.middleware.js";
import { AddStudentDto } from "./dto/addStudent.dto.js";
import { trackController } from "./tracker.controller.js";
import { requireAuth } from "../../common/middleware/auth.middleware.js";


const router:Router = express.Router();
const controller = new trackController();

router.post("/add-student", validateMiddleware(AddStudentDto),controller.addStudent );
router.get("/leaderboard", controller.leaderBoard);
router.get("/export", requireAuth, controller.exportLeaderboard);
router.post("/sync", controller.triggerUpdate);

export { router as trackerRoutes };