// controllers/domainController.js
import Domain from "../models/domainModel.js";
import Dept from "../models/deptModel.js";
import mongoose from "mongoose";
import ElectiveSubject from "../models/electivesubModel.js";
/* Create Domain */
export const createDomain = async (req, res, next) => {
  try {
    const { domain_id, name, dept_id, staffs, subjects } = req.body;
    if (!domain_id || !name || !dept_id) {
      return res.status(400).json({ message: "domain_id, name, and dept_id are required" });
    }

    const exists = await Domain.findOne({ domain_id });
    if (exists) return res.status(409).json({ message: "Domain ID already exists" });

    const domain = new Domain({
      domain_id,
      name,
      dept_id,
      staffs: staffs || [],
      subjects: subjects || [],
    });

    await domain.save();

    // Add domain_id to department.domains array
    const dept = await Dept.findOne({ dept_id });
    if (dept && !dept.domains.includes(domain_id)) {
      dept.domains.push(domain_id);
      await dept.save();
    }

    res.status(201).json(domain);
  } catch (err) {
    next(err);
  }
};

/* Get all domains */
export const getAllDomains = async (req, res, next) => {
  try {
    const domains = await Domain.find();
    res.json(domains);
  } catch (err) {
    next(err);
  }
};

/* Get single domain by domain_id */
export const getDomain = async (req, res, next) => {
  try {
    const { id } = req.params;
    const domain = await Domain.findOne({ domain_id: id });
    if (!domain) return res.status(404).json({ message: "Domain not found" });
    res.json(domain);
  } catch (err) {
    next(err);
  }
};

/* Update/Edit Domain */
export const updateDomain = async (req, res, next) => {
  try {
    const { id } = req.params; // domain_id
    const update = req.body;

    const domain = await Domain.findOneAndUpdate({ domain_id: id }, update, { new: true });
    if (!domain) return res.status(404).json({ message: "Domain not found" });

    // If department_id changed, update old and new department arrays
    if (update.dept_id && update.dept_id !== domain.dept_id) {
      // Remove from old dept
      const oldDept = await Dept.findOne({ dept_id: domain.dept_id });
      if (oldDept) {
        oldDept.domains = oldDept.domains.filter(d => d !== id);
        await oldDept.save();
      }

      // Add to new dept
      const newDept = await Dept.findOne({ dept_id: update.dept_id });
      if (newDept && !newDept.domains.includes(id)) {
        newDept.domains.push(id);
        await newDept.save();
      }
    }

    res.json(domain);
  } catch (err) {
    next(err);
  }
};

/* Delete Domain */
export const deleteDomain = async (req, res, next) => {
  try {
    const { id } = req.params; // domain_id
    const domain = await Domain.findOneAndDelete({ domain_id: id });
    if (!domain) return res.status(404).json({ message: "Domain not found" });

    // Remove from department.domains array
    const dept = await Dept.findOne({ dept_id: domain.dept_id });
    if (dept) {
      dept.domains = dept.domains.filter(d => d !== id);
      await dept.save();
    }

    res.json({ message: "Domain deleted", domain });
  } catch (err) {
    next(err);
  }
};

/* Get all staffs in a domain */
export const getDomainStaffs = async (req, res, next) => {
  try {
    const { id } = req.params; // domain_id
    const domain = await Domain.findOne({ domain_id: id });
    if (!domain) return res.status(404).json({ message: "Domain not found" });
    res.json(domain.staffs);
  } catch (err) {
    next(err);
  }
};

/* Get all subjects in a domain */
export const getDomainSubjects = async (req, res, next) => {
  try {
    const { id } = req.params; // domain_id
    const domain = await Domain.findOne({ domain_id: id });
    if (!domain) return res.status(404).json({ message: "Domain not found" });
    res.json(domain.subjects);
  } catch (err) {
    next(err);
  }
};

// GET /api/domains/:dept_id
export const getDomainsByDepartment = async (req, res) => {
  try {
    const { dept_id } = req.params; // take dept_id from URL

    if (!dept_id) {
      return res.status(400).json({ message: "dept_id is required" });
    }

    const domains = await Domain.find({ dept_id });

    if (!domains.length) {
      return res.status(404).json({ message: "No domains found for this department" });
    }

    res.status(200).json(domains);
  } catch (error) {
    console.error("Error fetching domains:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a new elective subject under a domain
export const addElectiveSubjectToDomain = async (req, res) => {
  try {
    const { domain_id } = req.params;
    const { subject_id, name, credit } = req.body;

    // Check if domain exists
    const domain = await Domain.findOne({ domain_id });
    if (!domain) {
      return res.status(404).json({ message: "Domain not found" });
    }

    // Create the elective subject
    const newSubject = new ElectiveSubject({
      subject_id,
      name,
      domain_id,
      credit,
    });

    await newSubject.save();

    // Add subject to domain's subjects list
    domain.subjects.push(subject_id);
    await domain.save();

    res.status(201).json({
      message: "Elective subject added successfully under domain",
      subject: newSubject,
    });
  } catch (error) {
    console.error("Error adding elective subject:", error);
    res.status(500).json({ message: "Server error" });
  }
};
