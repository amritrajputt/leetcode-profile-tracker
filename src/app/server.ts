import type { Express } from "express";
import express from "express";
export function createApplication(): Express {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    return app;
}