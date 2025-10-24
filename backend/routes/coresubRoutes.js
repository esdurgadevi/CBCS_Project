// routes/coreSubRoutes.js
import express from "express";
import {
  createCoreSubject,
  getAllCoreSubjects,
  getCoreSubject,
  getSubjectsBySemester,
  updateCoreSubject,
  deleteCoreSubject,
  getDeptCoreSubjectsBySemester
} from "../controllers/coresubController.js";
const router = express.Router();
// CRUD
router.post("/", createCoreSubject);
router.get("/", getAllCoreSubjects);
router.get("/:id", getCoreSubject);
router.put("/:id", updateCoreSubject);
router.delete("/:id", deleteCoreSubject);
router.get("/:dept_id/:semester",getDeptCoreSubjectsBySemester);
// extra endpoint: get by semester
router.get("/semester/:semester", getSubjectsBySemester);
export default router;
