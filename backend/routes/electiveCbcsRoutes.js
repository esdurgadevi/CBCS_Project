import express from "express";
import {
  createElectiveCbcs,
  getAllElectiveCbcs,
  getElectiveCbcsById,
  submitElectiveStudentCbcs,
  deleteElectiveCbcs,
  updateFeedbackStatus,
  getPendingStudents,
  submitStudentFeedbackBatch,
  updateCbcsStatus
} from "../controllers/electiveCbcsController.js";
import uploadStudentExcel from "../middlewares/uploadStudentExcel.js"; // handles Excel file uploads
import { verifyToken } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/", uploadStudentExcel.single("student_excel"), createElectiveCbcs);

router.get("/", getAllElectiveCbcs);

router.get("/:id", getElectiveCbcsById);

router.post("/stu/:id", submitElectiveStudentCbcs);
router.delete("/:cbcs_id", verifyToken, deleteElectiveCbcs);
// 🆕 Update CBCS status (true/false)
router.put("/:cbcs_id/updateCbcs", updateCbcsStatus);
// 🆕 Update Feedback status (true/false)
router.put("/:cbcs_id/updateFeedback", updateFeedbackStatus);

// 🆕 Get students who haven’t filled the CBCS (with ?cbcs_id=...&download=true for Excel)
router.get("/:cbcs_id/pending", getPendingStudents);

router.post("/:cbcs_id/:regno/submit-feedback", submitStudentFeedbackBatch);
export default router;
