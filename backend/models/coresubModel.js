// models/coreSubModel.js
import mongoose from "mongoose";

const coreSubSchema = new mongoose.Schema(
  {
    subject_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department_id: {
      type: String, // plain dept_id, no reference
      required: true,
      trim: true,
    },
    semester_no: {
      type: Number,
      required: true,
    },
    credit: {
      type: Number,
      default: 3,
    },
  }
);

const CoreSubject = mongoose.model("CoreSubject", coreSubSchema);
export default CoreSubject;
