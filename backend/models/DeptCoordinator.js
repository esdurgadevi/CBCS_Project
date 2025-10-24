import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const deptCoordinatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dept_id: {
    type: String,
    required: true, // example: "CSE", "IT", etc.
  },
});

// hash password before saving
deptCoordinatorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// compare passwords
deptCoordinatorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const DeptCoordinator = mongoose.model("DeptCoordinator", deptCoordinatorSchema);
export default DeptCoordinator;
