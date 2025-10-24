// controllers/electiveSubController.js
import ElectiveSub from "../models/electivesubModel.js";
// Create Elective Subject
const createElectiveSub = async (req, res) => {
  try {
    const { subject_id, name, domain_id, credit } = req.body;
    const newSubject = new ElectiveSub({
      subject_id,
      name,
      domain_id,
      credit,
    });
    await newSubject.save();
    res
      .status(201)
      .json({ message: "Elective subject created successfully", data: newSubject });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating elective subject", error: error.message });
  }
};
// Get all Elective Subjects
const getAllElectiveSubs = async (req, res) => {
  try {
    const subjects = await ElectiveSub.find();
    res.status(200).json(subjects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching elective subjects", error: error.message });
  }
};

// Get one Elective Subject by subject_id
const getElectiveSubById = async (req, res) => {
  try {
    const subject = await ElectiveSub.findOne({ subject_id: req.params.id });
    if (!subject) return res.status(404).json({ message: "Elective subject not found" });
    res.status(200).json(subject);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching elective subject", error: error.message });
  }
};
// Update Elective Subject
const updateElectiveSub = async (req, res) => {
  try {
    const subject = await ElectiveSub.findOneAndUpdate(
      { subject_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!subject) return res.status(404).json({ message: "Elective subject not found" });
    res.status(200).json({ message: "Elective subject updated", data: subject });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating elective subject", error: error.message });
  }
};

// Delete Elective Subject
const deleteElectiveSub = async (req, res) => {
  try {
    const subject = await ElectiveSub.findOneAndDelete({ subject_id: req.params.id });
    if (!subject) return res.status(404).json({ message: "Elective subject not found" });
    res.status(200).json({ message: "Elective subject deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting elective subject", error: error.message });
  }
};

// Filter by domain_id
const getElectiveSubsByDomain = async (req, res) => {
  try {
    const { domain_id } = req.params;
    const subjects = await ElectiveSub.find({ domain_id });
    res.status(200).json(subjects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching subjects by domain", error: error.message });
  }
};
export {
  createElectiveSub,
  getAllElectiveSubs,
  getElectiveSubById,
  updateElectiveSub,
  deleteElectiveSub,
  getElectiveSubsByDomain,
};
