import nodemailer from "nodemailer";
import crypto from "crypto";
import StudentOtp from "../models/studentOtpModel.js";

//send otp
export const sendOtp = async (req, res) => {
  try {
    const { regno, name, email } = req.body;
    if (!regno || !name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);

    // Find existing OTP for this student
    let studentOtp = await StudentOtp.findOne({ regno });

    if (studentOtp) {
      // Update OTP and expiresAt if already exists
      studentOtp.otp = otp;
      studentOtp.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    } else {
      // Create new OTP document
      studentOtp = new StudentOtp({
        regno,
        name,
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
    }

    await studentOtp.save();

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CBCS Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your CBCS OTP",
      html: `
        <h3>Hello ${name}</h3>
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>Valid for 10 minutes.</p>
      `,
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP" });
  }
};


//get student by id
export const getStudentOtpByRegno = async (req, res) => {
  try {
    const { regno } = req.params;

    if (!regno) {
      return res.status(400).json({ success: false, message: "Regno is required" });
    }

    const student = await StudentOtp.findOne({ regno });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.json({
      success: true,
      data: {
        regno: student.regno,
        name: student.name,
        email: student.email,
        otp: student.otp,
        expiresAt: student.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch student data" });
  }
};

//verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { regno, otp } = req.body;
    if (!regno || !otp) {
      return res.status(400).json({ success: false, message: "Regno and OTP required" });
    }

    const record = await StudentOtp.findOne({ regno });
    if (!record) return res.status(400).json({ success: false, message: "OTP not found" });

    if (record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (record.otp.toString() !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // ✅ Delete after verification (one-time use)
    //await StudentOtp.deleteOne({ regno });

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};
