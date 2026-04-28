import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../errors/error.js";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(ApiError.unAuthorized("Access denied. No token provided."));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return next(ApiError.unAuthorized("Access denied. Invalid token format."));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key_123");
        req.user = decoded;
        next();
    } catch (error) {
        return next(ApiError.unAuthorized("Invalid or expired token."));
    }
};
