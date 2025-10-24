import mongoose from "mongoose";

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

// 🆕 Track individual submissions
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

const studentCbcsSchema = new mongoose.Schema(
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
    department: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    subjects: [subjectSchema],

    // 🆕 Excel Paths
    allocation_excel_path: {
      type: String,
      required: true,
    },
    student_list_excel_path: {
      type: String,
      required: true,
    },

    // 🆕 Direct Link
    cbcs_link: {
      type: String,
      required: true,
    },

    // 🆕 Total students count (used to check completion)
    total_students: {
      type: Number,
      default: 0,
    },

    // 🆕 Store all student submissions
    submissions: [submissionSchema],

    // 🆕 Completion Status
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

const StudentCbcs = mongoose.model("StudentCbcs", studentCbcsSchema);
export default StudentCbcs;
