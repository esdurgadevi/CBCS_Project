import express from "express";
import { submitStudentFeedbackBatch,updateCbcsStatus,updateFeedbackStatus,getPendingStudents,createCbcs, getAllCbcs, getCbcsById,submitStudentCbcs,deleteCbcs } from "../controllers/studentCbcsController.js";
import uploadStudentExcel from "../middlewares/uploadStudentExcel.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
const router = express.Router();

// POST - Add CBCS
router.post("/", uploadStudentExcel.single("student_excel"), createCbcs);
// GET - Get all CBCS
router.get("/", getAllCbcs);
router.post("/stu/:id",submitStudentCbcs);
// GET - Get CBCS by cbcs_id (manual id)
router.get("/:id", getCbcsById);

router.delete("/:cbcs_id", verifyToken, deleteCbcs);

// 🆕 Update CBCS status (true/false)
router.put("/:cbcs_id/updateCbcs", updateCbcsStatus);

// 🆕 Update Feedback status (true/false)
router.put("/:cbcs_id/updateFeedback", updateFeedbackStatus);

// 🆕 Get students who haven’t filled the CBCS (with ?cbcs_id=...&download=true for Excel)
router.get("/:cbcs_id/pending", getPendingStudents);

router.post("/:cbcs_id/:regno/submit-feedback", submitStudentFeedbackBatch);
export default router;
