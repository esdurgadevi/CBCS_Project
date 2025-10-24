// models/electivesubModel.js
import mongoose from "mongoose";

const electivesubSchema = new mongoose.Schema({
  subject_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  domain_id: {
    type: String, // custom domain id
    ref: "Domain",
    required: true,
  },
  credit: {
    type: Number,
    required: true,
  },
});

const ElectiveSubject = mongoose.model("ElectiveSubject", electivesubSchema);

export default ElectiveSubject;