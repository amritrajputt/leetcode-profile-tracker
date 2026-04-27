import type { Router } from "express";
import express from "express";


const router:Router = express.Router();

router.post("/add-student", authMiddleware, addStudentHandler);