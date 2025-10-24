import Admin from "../models/Admin.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
const SECRET_KEY = "hello";
// ✅ Login
export const login = async (req, res) => {
  try {
    const { role, username, password } = req.body;
    if (role === "student") {
      return res.status(200).json({ message: "🚧 Student login not implemented yet" });
    }
    if (role === "admin") {
      const admin = await Admin.findOne({ username, password });
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign(
         { id: admin._id, username: admin.username, role: "admin" },
          SECRET_KEY,
          { expiresIn: "1h" } // token valid for 1 hour
      );
      return res.status(200).json({ message: "✅ Admin login successful", token });
    }

    res.status(400).json({ error: "Invalid role" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ Forgot – send simple email with reset link
export const forgot = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email exists in Admin collection
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: "Email not found in Admins" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Reset link with email as query param
    const resetLink = `http://localhost:5173/reset?email=${email}&username=${admin.username}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `<p>Click the link to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
        message: "✅ Email found successfully!", 
        admin: admin 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending email" });
  }
};


// ✅ Reset password by email
export const resetPasswordByEmail = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.password = newPassword; // ⚠ hash if needed
    await admin.save();

    res.status(200).json({ message: "✅ Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
