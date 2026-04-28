import type { Router } from "express";
import express from "express";
import { validate } from "node-cron";
import { validateMiddleware } from "../../common/middleware/validate.middleware.js";
import { AddStudentDto } from "./dto/addStudent.dto.js";
import { trackController } from "./tracker.controller.js";


const router:Router = express.Router();
const controller = new trackController();

router.post("/add-student", validateMiddleware(AddStudentDto),controller.addStudent );
router.get("/leaderboard", controller.leaderBoard);
router.get("/export", controller.exportLeaderboard);

export { router as trackerRoutes };