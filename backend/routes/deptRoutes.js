// routes/deptRoutes.js
import express from "express";
import {
  createDept,
  getDepts,
  getDept,
  getDeptStaffs,
  getDeptCoreSubjectsBySemester,
  getDeptDomains,
  updateDept,
  deleteDept,
  getDeptCoreSubjects
} from "../controllers/deptController.js";

const router = express.Router();

// CRUD
router.post("/", createDept);
router.get("/", getDepts);
router.get("/:id", getDept);
router.put("/:id", updateDept);
router.delete("/:id", deleteDept);

// extra endpoints
router.get("/:id/staffs", getDeptStaffs);
// Get core subjects in department filtered by semester
router.get("/:dept_id/coresubjects/:semester", getDeptCoreSubjectsBySemester);
router.get("/:dept_id/coresubjects",getDeptCoreSubjects);
router.get("/:id/domains", getDeptDomains);

export default router;
