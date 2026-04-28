import type { Express } from "express";
import express, { type Request, type Response, type NextFunction } from "express";
import { trackerRoutes } from "./module/tracker/tracker.routes.js";
import { authRoutes } from "./module/auth/auth.routes.js";
import { ApiError } from "./common/errors/error.js";
import { ApiResponse } from "./common/response/response.js";
export function createApplication(): Express {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Mount routes
    app.use("/api/v1/tracker", trackerRoutes);
    app.use("/api/v1/auth", authRoutes);

    // Global Error Handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ApiError) {
            res.status(err.statusCode).json(ApiResponse.error(err.message, err.statusCode, null));
            return;
        }
        console.error(err);
        res.status(500).json(ApiResponse.error("Internal Server Error", 500, null));
    });

    return app;
}