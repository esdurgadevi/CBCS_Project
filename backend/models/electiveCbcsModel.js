import mongoose from "mongoose";

// --- Reuse same sub-schemas ---
const staffAllocationSchema = new mongoose.Schema(
  {
    staff_id: { type: String, required: true },
    staff_name: { type: String, required: true },
    student_limit: { type: Number, required: true },
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    subject_id: { type: String, required: true },
    name: { type: String, required: true },
    staffs: [staffAllocationSchema],
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    regno: { type: String, required: true },
    email: { type: String, required: true },
    subjects: [
      {
        subject_id: String,
        staff_id: String,
      },
    ],
  },
  { _id: false }
);

// --- Elective CBCS Schema ---
const electiveCbcsSchema = new mongoose.Schema(
  {
    cbcs_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    batch: {
      type: String,
      required: true,
      trim: true,
    },
    domain: { // 🆕 replaced "department" with "domain"
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    subjects: [subjectSchema],

    // Excel Paths
    allocation_excel_path: {
      type: String,
      required: true,
    },
    student_list_excel_path: {
      type: String,
      required: true,
    },

    // Direct Link
    cbcs_link: {
      type: String,
      required: true,
    },

    // Total students count
    total_students: {
      type: Number,
      default: 0,
    },

    // Student submissions
    submissions: [submissionSchema],

    // Completion Status
    complete: {
      type: Boolean,
      default: false,
    },
    cbcs:{
      type:Boolean,
      default:true,
    },
    feedback:{
      type:Boolean,
      default:false
    },
    feedback_submissions: {
      type: [String], // store regnos that already submitted feedback
      default: []
    }
  },
  { timestamps: true }
);

const ElectiveCbcs = mongoose.model("ElectiveCbcs", electiveCbcsSchema);
export default ElectiveCbcs;
