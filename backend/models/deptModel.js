import mongoose from "mongoose";
const deptSchema = new mongoose.Schema(
  {
    dept_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dept_name: {
      type: String,
      required: true,
      trim: true,
    },
    staffs: {
      type: [String], // custom staff_ids only
      default: [],
    },
    core_subjects: {
      type: [String], // custom subject_ids only
      default: [],
    },
    domains: {
      type: [String], // custom domain_ids only
      default: [],
    },
  }
);

const Dept = mongoose.model("Dept", deptSchema);
export default Dept;
