// routes/domainRoutes.js
import express from "express";
import {
  createDomain,
  getAllDomains,
  getDomain,
  updateDomain,
  deleteDomain,
  getDomainStaffs,
  getDomainSubjects,
  getDomainsByDepartment,
  addElectiveSubjectToDomain
} from "../controllers/domainController.js";

const router = express.Router();

// CRUD
router.post("/", createDomain);
router.get("/", getAllDomains);
router.get("/:id", getDomain);
router.put("/:id", updateDomain);
router.delete("/:id", deleteDomain);

// Get staffs and subjects
router.get("/:id/staffs", getDomainStaffs);
router.get("/:id/subjects", getDomainSubjects);
router.get("/dept/:dept_id",getDomainsByDepartment);
router.post("/:domain_id/elective", addElectiveSubjectToDomain);
export default router;
