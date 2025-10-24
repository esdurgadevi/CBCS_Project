import mongoose from "mongoose";

const studentOtpSchema = new mongoose.Schema({
  regno: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  otp: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model("StudentOtp", studentOtpSchema);
