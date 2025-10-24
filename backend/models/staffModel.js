import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  content_delivery: { type: Number, min: 0, max: 5, default: 0 },
  practical_explanation: { type: Number, min: 0, max: 5, default: 0 },
  teaching_methodology: { type: Number, min: 0, max: 5, default: 0 },
  structure_organization: { type: Number, min: 0, max: 5, default: 0 },
  pace: { type: Number, min: 0, max: 5, default: 0 },
  interaction: { type: Number, min: 0, max: 5, default: 0 },
  overall_satisfaction: { type: Number, min: 0, max: 5, default: 0 },
  count: { type: Number, default: 0 }
});

const staffSchema = new mongoose.Schema({
  staff_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  domain_id: { type: String, ref: "Domain" },
  dept_id: { type: String, ref: "Department" },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  feedback: { type: feedbackSchema, default: () => ({}) }
});

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
