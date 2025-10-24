// controllers/deptController.js
import Dept from "../models/deptModel.js";
/* Create Department */
export const createDept = async (req, res, next) => {
  try {
    const { dept_id, dept_name, staffs, core_subjects, domains } = req.body;
    if (!dept_id || !dept_name) {
      return res.status(400).json({ message: "dept_id and dept_name are required" });
    }
    const exists = await Dept.findOne({ dept_id });
    if (exists) {
      return res.status(409).json({ message: "Department with this dept_id already exists" });
    }
    const dept = new Dept({
      dept_id,
      dept_name,
      staffs: staffs || [],
      core_subjects: core_subjects || [],
      domains: domains || [],
    });
    await dept.save();
    res.status(201).json(dept);
  } catch (err) {
    next(err);
  }
};
/* Get all departments */
export const getDepts = async (req, res, next) => {
  try {
    const depts = await Dept.find();
    res.json(depts);
  } catch (err) {
    next(err);
  }
};
/* Get single department (by dept_id or _id) */
export const getDept = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dept = await Dept.findOne({ dept_id: id });
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json(dept);
  } catch (err) {
    next(err);
  }
};
/* Get all staffs in department */
export const getDeptStaffs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dept = await Dept.findOne({ dept_id: id });
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json(dept.staffs);
  } catch (err) {
    next(err);
  }
};
export const getDeptCoreSubjects = async (req, res, next) => { 
  try { 
    const { id } = req.params; 
    const dept = await Dept.findOne({ dept_id: id }); 
    if (!dept) return res.status(404).json({ message: "Department not found" }); 
    res.json(dept.core_subjects); 
  } 
  catch (err) { next(err);
  } };
/* Get core subjects in a department by semester */
export const getDeptCoreSubjectsBySemester = async (req, res, next) => {
  try {
    const { dept_id, semester } = req.params;
    const dept = await Dept.findOne({ dept_id });
    if (!dept) return res.status(404).json({ message: "Department not found" });

    // Filter core_subjects array based on semester
    const filteredSubjects = dept.core_subjects.filter(sub => sub.semester_no === Number(semester));
    res.json(filteredSubjects);
  } catch (err) {
    next(err);
  }
};

/* Get all domains in department */
export const getDeptDomains = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dept = await Dept.findOne({ dept_id: id });
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json(dept.domains);
  } catch (err) {
    next(err);
  }
};

/* Update department */
export const updateDept = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;

    const dept = await Dept.findOneAndUpdate(
       { dept_id: id },
      update,
      { new: true }
    );

    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json(dept);
  } catch (err) {
    next(err);
  }
};

/* Delete department */
export const deleteDept = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dept = await Dept.findOneAndDelete({ dept_id: id });
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted", dept });
  } catch (err) {
    next(err);
  }
};
