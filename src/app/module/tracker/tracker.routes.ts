import type { Router } from "express";
import express from "express";
import { validate } from "node-cron";
import { validateMiddleware } from "../../common/middleware/validate.middleware.js";
import { AddStudentDto } from "./dto/addStudent.dto.js";
import { trackController } from "./tracker.controller.js";


const router:Router = express.Router();

router.post("/add-student", validateMiddleware(AddStudentDto),trackController.addStudent );

export { router as trackerRoutes };