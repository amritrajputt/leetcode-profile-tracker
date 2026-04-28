import type { Request, Response } from "express";
import { ApiError } from "../../common/errors/error.js";
import { ApiResponse } from "../../common/response/response.js";
import { db } from "../../../db/index.js";
import { facultyTable } from "../../../db/schema.js";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthController {
    public async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            throw ApiError.badRequest("Email and password are required");
        }

        const faculty = await db.select().from(facultyTable).where(eq(facultyTable.email, email)).limit(1);

        if (faculty.length === 0) {
            throw ApiError.unAuthorized("Invalid credentials");
        }

        const isMatch = await bcryptjs.compare(password, faculty[0]!.password);

        if (!isMatch) {
            throw ApiError.unAuthorized("Invalid credentials");
        }

        const token = jwt.sign(
            { id: faculty[0]!.id, role: "faculty" },
            process.env.JWT_SECRET || "default_secret_key_123",
            { expiresIn: "7d" }
        );

        res.status(200).json(ApiResponse.success("Login successful", 200, {
            token,
            faculty: {
                id: faculty[0]!.id,
                name: faculty[0]!.name,
                email: faculty[0]!.email
            }
        }));
    }
}
