import express from "express";
import { sendOtp, verifyOtp, getStudentOtpByRegno } from "../controllers/otpController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/student/:regno", getStudentOtpByRegno);
export default router;
