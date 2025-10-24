// routes/staffRoutes.js
import express from "express";
import {
  createStaff,
  getAllStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffByDepartment,
  getStaffByDomain,
  getStaffByDeptAndDomain,
  upload,
  submitFeedback
} from "../controllers/staffController.js";
import Staff from "../models/staffModel.js";
const router = express.Router();

// ✅ Create staff with image upload
router.post("/", upload.single("image"), createStaff);

// ✅ Get all staff
router.get("/", getAllStaffs);

// ✅ Get one staff by staff_id
router.get("/:staff_id", getStaffById);

// ✅ Update staff by staff_id (with optional image)
router.put("/:staff_id", upload.single("image"), updateStaff);

// ✅ Delete staff by staff_id
router.delete("/:staff_id", deleteStaff);

// ✅ Get staff by department
router.get("/department/:dept_id", getStaffByDepartment);

// ✅ Get staff by domain
router.get("/domain/:domain_id", getStaffByDomain);

// ✅ Get staff by department & domain
router.get("/filter/:dept_id/:domain_id", getStaffByDeptAndDomain);

// POST feedback for a staff member
router.post("/feedback/:staff_id", submitFeedback);


export default router;
