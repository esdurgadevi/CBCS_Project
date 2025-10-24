// controllers/coreSubController.js
import CoreSubject from "../models/coresubModel.js";
import Dept from "../models/deptModel.js";

/* Create Core Subject */
export const createCoreSubject = async (req, res, next) => {
  try {
    const { subject_id, name, department_id, semester_no, credit } = req.body;
    if (!subject_id || !name || !department_id || !semester_no) {
      return res.status(400).json({ message: "subject_id, name, department_id and semester_no are required" });
    }

    // Check if core subject with same subject_id exists
    const exists = await CoreSubject.findOne({ subject_id });
    if (exists) return res.status(409).json({ message: "subject_id already exists" });

    // Create core subject
    const coreSub = new CoreSubject({
      subject_id,
      name,
      department_id,
      semester_no,
      credit: credit || 3,
    });

    await coreSub.save();

    // Update department core_subjects array
    const dept = await Dept.findOne({ dept_id: department_id });
    if (dept && !dept.core_subjects.includes(subject_id)) {
      dept.core_subjects.push(subject_id);
      await dept.save();
    }

    res.status(201).json(coreSub);
  } catch (err) {
    next(err);
  }
};

/* Get all core subjects */
export const getAllCoreSubjects = async (req, res, next) => {
  try {
    const subjects = await CoreSubject.find();
    res.json(subjects);
  } catch (err) {
    next(err);
  }
};

/* Get single core subject by subject_id */
export const getCoreSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await CoreSubject.findOne({ subject_id: id });
    if (!subject) return res.status(404).json({ message: "Core subject not found" });
    res.json(subject);
  } catch (err) {
    next(err);
  }
};

/* Get subjects by semester */
export const getSubjectsBySemester = async (req, res, next) => {
  try {
    const { semester } = req.params;
    const subjects = await CoreSubject.find({ semester_no: Number(semester) });
    res.json(subjects);
  } catch (err) {
    next(err);
  }
};
/* Get core subjects in a department by semester */
export const getDeptCoreSubjectsBySemester = async (req, res, next) => {
  try {
    const { dept_id, semester } = req.params;
    const dept = await Dept.findOne({ dept_id });
    if (!dept) return res.status(404).json({ message: "Department not found" });

    // Fetch core subject documents
    const subjects = await CoreSubject.find({
      subject_id: { $in: dept.core_subjects }, // IDs in dept.core_subjects
      semester_no: Number(semester)
    });

    res.json(subjects);
  } catch (err) {
    next(err);
  }
};

/* Update core subject */
export const updateCoreSubject = async (req, res, next) => {
  try {
    const { id } = req.params; // subject_id
    const update = req.body;

    const subject = await CoreSubject.findOneAndUpdate({ subject_id: id }, update, { new: true });
    if (!subject) return res.status(404).json({ message: "Core subject not found" });

    // If department_id changed, update old and new dept core_subjects arrays
    if (update.department_id && update.department_id !== subject.department_id) {
      // Remove from old department
      const oldDept = await Dept.findOne({ dept_id: subject.department_id });
      if (oldDept) {
        oldDept.core_subjects = oldDept.core_subjects.filter(sub => sub !== id);
        await oldDept.save();
      }

      // Add to new department
      const newDept = await Dept.findOne({ dept_id: update.department_id });
      if (newDept && !newDept.core_subjects.includes(id)) {
        newDept.core_subjects.push(id);
        await newDept.save();
      }
    }

    res.json(subject);
  } catch (err) {
    next(err);
  }
};

/* Delete core subject */
export const deleteCoreSubject = async (req, res, next) => {
  try {
    const { id } = req.params; // subject_id
    const subject = await CoreSubject.findOneAndDelete({ subject_id: id });
    if (!subject) return res.status(404).json({ message: "Core subject not found" });

    // Remove from department core_subjects array
    const dept = await Dept.findOne({ dept_id: subject.department_id });
    if (dept) {
      dept.core_subjects = dept.core_subjects.filter(sub => sub !== id);
      await dept.save();
    }

    res.json({ message: "Core subject deleted", subject });
  } catch (err) {
    next(err);
  }
};
