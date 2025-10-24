// models/domainModel.js
import mongoose from "mongoose";

const domainSchema = new mongoose.Schema({
  domain_id: {
    type: String,
    required: true,
    unique: true, // custom domain id you create
  },
  name: {
    type: String,
    required: true,
  },
  staffs: [
    {
      type: String, // store your custom staff_id, not MongoDB _id
    },
  ],
  subjects: [
    {
      type: String, // store elective subject_id (custom id)
    },
  ],
  dept_id: {
    type: String, // your custom department id
    required: true,
  }
});

const Domain = mongoose.model("Domain", domainSchema);

export default Domain;