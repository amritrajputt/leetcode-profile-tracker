import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validateMiddleware } from "../../common/middleware/validate.middleware.js";
import { LoginDto } from "./dto/login.dto.js";

const router:Router = Router();
const authController = new AuthController();

router.post("/login", validateMiddleware(LoginDto), authController.login);

export {router as authRoutes}
