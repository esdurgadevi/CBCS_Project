// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// import deptcoRoutes from "./routes/deptcoRoutes.js";
// Import routes
import deptRoutes from "./routes/deptRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import electiveSubRoutes from "./routes/electivesubRoutes.js";
import coreSubRoutes from "./routes/coresubRoutes.js";   // ✅ Core subjects
import domainRoutes from "./routes/domainRoutes.js";     // ✅ Domains
import adminRoutes from "./routes/adminRoutes.js"
import studentCbcsRoutes from "./routes/studentCbcsRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import electiveCbcsRoutes from "./routes/electiveCbcsRoutes.js";
// Initialize app
dotenv.config();
const app = express();
// Middleware
app.use(express.json()); // Parse JSON
app.use(cors());         // Handle cross-origin requests
const __dirname = path.resolve();

// Serve uploads folder
// Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/departments", deptRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/electives", electiveSubRoutes);
app.use("/api/coresubjects", coreSubRoutes);   // ✅ Core subjects API
app.use("/api/domains", domainRoutes);         // ✅ Domains API
app.use("/api/admin", adminRoutes);
app.use("/api/student_cbcs",studentCbcsRoutes)
app.use("/api/otp", otpRoutes);
app.use("/api/elective-cbcs",electiveCbcsRoutes);
// app.use("/api", deptcoRoutes);

// Connect DB and Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
