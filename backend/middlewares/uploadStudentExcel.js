import multer from "multer";
import path from "path";
import fs from "fs";

const studentListFolder = path.join(process.cwd(), "uploads", "student_list");

// ✅ Create folder if not exists
if (!fs.existsSync(studentListFolder)) {
  fs.mkdirSync(studentListFolder, { recursive: true });
}

// ✅ Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, studentListFolder);
  },
  filename: function (req, file, cb) {
    const uniqueName = `student_list_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadStudentExcel = multer({ storage });
export default uploadStudentExcel;
