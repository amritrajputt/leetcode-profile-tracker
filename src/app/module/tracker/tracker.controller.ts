import type { Request, Response } from "express";
import { AddStudentDto } from "./dto/addStudent.dto.js";
import { ApiError } from "../../common/errors/error.js";
import { db } from "../../../db/index.js";
import { studentsTable } from "../../../db/schema.js";
import { eq } from "drizzle-orm";
import { ApiResponse } from "../../common/response/response.js";

export const trackController = {
    addStudent: async (req: Request, res: Response) => {
        const {name,rollNumber,batchYear,email,course,branch,section,leetcodeUserName,geeksforgeeksUserName} = req.body;
        
        const isExist = await db.select().from(studentsTable).where(eq(studentsTable.rollNumber,rollNumber));
        if(isExist.length>0){
            throw ApiError.badRequest("Student already exists");
        }

        const student = await db.insert(studentsTable).values({
            name,
            rollNumber,
            batchYear,
            email,
            course,
            branch,
            section,
            leetcodeUserName,
            geeksforgeeksUserName,
        }).returning({
            name:studentsTable.name,
            rollNumber:studentsTable.rollNumber,
        });

        res.status(201).json(ApiResponse.created("Student added successfully", student[0]));
    }

}