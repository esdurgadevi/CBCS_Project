import express from "express";
import { login, forgot, resetPasswordByEmail } from "../controllers/adminController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/forgot", forgot);
router.post("/reset-password-email", resetPasswordByEmail);


export default router;
