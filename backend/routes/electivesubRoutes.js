// routes/electiveSubRoutes.js
import express from "express";
import {
  createElectiveSub,
  getAllElectiveSubs,
  getElectiveSubById,
  updateElectiveSub,
  deleteElectiveSub,
  getElectiveSubsByDomain,
} from "../controllers/electivesubController.js";

const router = express.Router();

router.post("/", createElectiveSub);
router.get("/", getAllElectiveSubs);
router.get("/:id", getElectiveSubById);
router.put("/:id", updateElectiveSub);
router.delete("/:id", deleteElectiveSub);

// filter subjects by domain
router.get("/domain/:domain_id", getElectiveSubsByDomain);

export default router;
