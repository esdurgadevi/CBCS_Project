// controllers/staffController.js
import fs from "fs";
import path from "path";
import multer from "multer";
import Staff from "../models/staffModel.js";
import Dept from "../models/deptModel.js";
import Domain from "../models/domainModel.js";
const __dirname = path.resolve();

// ✅ Multer storage (store file in uploads/staffs/ with staff_id as filename)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads", "staffs");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg / .png
    cb(null, `${req.body.staff_id}${ext}`);
  },
});

export const upload = multer({ storage });

/// ✅ Create staff
export const createStaff = async (req, res) => {
  try {
    const { staff_id, name, dept_id, domain_id, email, phone } = req.body;

    // Build staff object
    const staffData = {
      staff_id,
      name,
      dept_id,
      domain_id,
      email,
      phone,
      image: req.file ? `uploads/staffs/${req.file.filename}` : "",
    };

    const staff = new Staff(staffData);
    await staff.save();

    // ✅ Add staff_id to department
    const dept = await Dept.findOne({ dept_id });
    if (dept && !dept.staffs.includes(staff.staff_id)) {
      dept.staffs.push(staff.staff_id);
      await dept.save();
    }

    // ✅ Add staff_id to domain (similar to department)
    const domain = await Domain.findOne({ domain_id });
    if (domain && !domain.staffs.includes(staff.staff_id)) {
      domain.staffs.push(staff.staff_id);
      await domain.save();
    }

    res.status(201).json({
      message: "Staff created successfully",
      staff,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// ✅ Get all staff
export const getAllStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find();
    res.status(200).json(staffs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get one staff by staff_id
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findOne({ staff_id: req.params.staff_id });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.status(200).json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update staff
export const updateStaff = async (req, res) => {
  try {
    const { name, dept_id, domain_id, email, phone } = req.body;

    const updateData = { name, dept_id, domain_id, email, phone };

    if (req.file) {
      updateData.image = `uploads/staffs/${req.file.filename}`;
    }
    const staff = await Staff.findOneAndUpdate(
      { staff_id: req.params.staff_id },
      updateData,
      { new: true }
    );

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.status(200).json({
      message: "Staff updated successfully",
      staff,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete staff

export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({ staff_id: req.params.staff_id });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // ✅ Remove staff_id from department
    const dept = await Dept.findOne({ dept_id: staff.dept_id });
    if (dept) {
      dept.staffs = dept.staffs.filter((s) => s !== staff.staff_id);
      await dept.save();
    }

    // ✅ Remove staff_id from domain (similar logic)
    const domain = await Domain.findOne({ domain_id: staff.domain_id });
    if (domain) {
      domain.staffs = domain.staffs.filter((s) => s !== staff.staff_id);
      await domain.save();
    }

    // ✅ Delete image file if exists
    if (staff.image && fs.existsSync(staff.image)) {
      fs.unlinkSync(staff.image);
    }

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get staff by department
export const getStaffByDepartment = async (req, res) => {
  try {
    const staffs = await Staff.find({ dept_id: req.params.dept_id });
    res.status(200).json(staffs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get staff by domain
export const getStaffByDomain = async (req, res) => {
  try {
    const staffs = await Staff.find({ domain_id: req.params.domain_id });
    res.status(200).json(staffs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get staff by department & domain
export const getStaffByDeptAndDomain = async (req, res) => {
  try {
    const { dept_id, domain_id } = req.params;
    const staffs = await Staff.find({ dept_id, domain_id });
    res.status(200).json(staffs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//feedback posting
export const submitFeedback = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const newFeedback = req.body; // new feedback ratings

    const staff = await Staff.findOne({ staff_id });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    // Get old feedback and count
    const oldFeedback = staff.feedback;
    const oldCount = oldFeedback.count;

    // Update average for each rating field
    for (const key in newFeedback) {
      if (typeof newFeedback[key] === "number" && oldFeedback[key] !== undefined) {
        oldFeedback[key] = (oldFeedback[key] * oldCount + newFeedback[key]) / (oldCount + 1);
      }
    }

    oldFeedback.count = oldCount + 1;
    staff.feedback = oldFeedback;
    await staff.save();

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: staff.feedback
    });
  } catch (err) {
    console.error("Feedback submission error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
