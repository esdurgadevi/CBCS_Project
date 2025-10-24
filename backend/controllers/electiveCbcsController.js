import ElectiveCbcs from "../models/electiveCbcsModel.js";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { submitFeedback } from "./staffController.js"; 
// ------------------------------
// POST - Create Elective CBCS + Generate Excel
// ------------------------------
export const createElectiveCbcs = async (req, res) => {
  try {
    const bodyData = JSON.parse(req.body.data);

    const newCbcs = new ElectiveCbcs({
      cbcs_id: bodyData.cbcs_id,
      batch: bodyData.batch,
      domain: bodyData.domain,
      semester: bodyData.semester,
      subjects: bodyData.subjects,
      allocation_excel_path: "",
      student_list_excel_path: "",
      cbcs_link: "",
      total_students: 0,
      submissions: [],
      complete: false
    });

    // ------------------------------
    // Generate Allocation Excel
    // ------------------------------
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Elective CBCS System";
    workbook.lastModifiedBy = "Elective CBCS System";
    workbook.created = new Date();
    workbook.modified = new Date();

    const colors = {
      subjectHeader: "FFFFFF00",
      columnHeader: "FFFF7F66",
      staffHeader: "FFDDEBF7",
      lightGray: "FFF2F2F2",
      borderGray: "FFD9D9D9",
      textDark: "FF000000",
    };

    for (const subject of bodyData.subjects) {
      const sheet = workbook.addWorksheet(`${subject.subject_id}`);

      // Subject header
      const subjectHeaderRow = sheet.addRow([`Subject: ${subject.subject_id} - ${subject.name}`]);
      sheet.mergeCells(1, 1, 1, subject.staffs.length * 2);
      subjectHeaderRow.eachCell(cell => {
        cell.font = { bold: true, size: 14, color: { argb: colors.textDark } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.subjectHeader } };
        cell.border = {
          top: { style: "medium", color: { argb: colors.borderGray } },
          left: { style: "medium", color: { argb: colors.borderGray } },
          bottom: { style: "medium", color: { argb: colors.borderGray } },
          right: { style: "medium", color: { argb: colors.borderGray } }
        };
      });

      // Staff headers (Row 2)
      const staffHeaders = [];
      subject.staffs.forEach(staff => {
        staffHeaders.push(`${staff.staff_id} - ${staff.staff_name}`, "");
      });
      const staffHeaderRow = sheet.addRow(staffHeaders);
      let colIndex = 1;
      subject.staffs.forEach(staff => {
        sheet.mergeCells(2, colIndex, 2, colIndex + 1);
        const cell = staffHeaderRow.getCell(colIndex);
        cell.font = { bold: true, size: 12, color: { argb: colors.textDark } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.staffHeader } };
        colIndex += 2;
      });

      // Column headers (Row 3)
      const columnHeaders = [];
      subject.staffs.forEach(() => columnHeaders.push("Regno", "Student's Name"));
      const columnHeaderRow = sheet.addRow(columnHeaders);
      columnHeaderRow.eachCell(cell => {
        cell.font = { bold: true, size: 11, color: { argb: colors.textDark } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.columnHeader } };
      });

      // Empty student rows
      for (let i = 0; i < 10; i++) {
        const emptyRow = [];
        subject.staffs.forEach(() => emptyRow.push("", ""));
        sheet.addRow(emptyRow);
      }

      // Column widths
      subject.staffs.forEach((staff, index) => {
        sheet.getColumn(index * 2 + 1).width = 15;
        sheet.getColumn(index * 2 + 2).width = 30;
      });

      // Freeze headers
      sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 3 }];
    }

    // ------------------------------
    // Save Excel
    // ------------------------------
    const folderPath = path.join(process.cwd(), "uploads", "elective_cbcs_excels");
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
    const allocationExcelName = `elective_cbcs_${newCbcs.cbcs_id}.xlsx`;
    const allocationExcelPath = path.join(folderPath, allocationExcelName);
    await workbook.xlsx.writeFile(allocationExcelPath);

    // ------------------------------
    // Handle student list if uploaded
    // ------------------------------
    let totalStudents = 0;
    let studentListPath = "";
    if (req.file) {
      const studentFolder = path.join(process.cwd(), "uploads", "elective_student_list");
      if (!fs.existsSync(studentFolder)) fs.mkdirSync(studentFolder, { recursive: true });
      const studentListName = `student_list_${newCbcs.cbcs_id}${path.extname(req.file.originalname)}`;
      studentListPath = path.join(studentFolder, studentListName);
      fs.renameSync(req.file.path, studentListPath);

      const studentWorkbook = new ExcelJS.Workbook();
      await studentWorkbook.xlsx.readFile(studentListPath);
      const studentSheet = studentWorkbook.worksheets[0];
      totalStudents = studentSheet.rowCount - 1; // exclude header
    }

    // ------------------------------
    // Finalize fields & save
    // ------------------------------
    const cbcsLink = `http://localhost:5173/cbcs/elective/${newCbcs.cbcs_id}`;
    newCbcs.allocation_excel_path = allocationExcelPath;
    newCbcs.student_list_excel_path = studentListPath || "";
    newCbcs.cbcs_link = cbcsLink;
    newCbcs.total_students = totalStudents;

    await newCbcs.save();

    res.status(201).json({ success: true, message: "Elective CBCS created successfully", data: newCbcs });
  } catch (error) {
    console.error("Error creating Elective CBCS:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ------------------------------
// GET - Get All Elective CBCS
// ------------------------------
export const getAllElectiveCbcs = async (req, res) => {
  try {
    const allCbcs = await ElectiveCbcs.find();
    res.status(200).json({ success: true, data: allCbcs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
// GET - Get Elective CBCS by ID
// ------------------------------
export const getElectiveCbcsById = async (req, res) => {
  try {
    const cbcs = await ElectiveCbcs.findOne({ cbcs_id: req.params.id });
    if (!cbcs) return res.status(404).json({ success: false, message: "Elective CBCS not found" });
    res.status(200).json({ success: true, data: cbcs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
// Submit student elective CBCS
// ------------------------------
export const submitElectiveStudentCbcs = async (req, res) => {
  try {
    const { cbcs_id, regno, name, email, subjects } = req.body;
    const cbcs = await ElectiveCbcs.findOne({ cbcs_id });
    if (!cbcs) return res.status(404).json({ success: false, message: "Elective CBCS not found" });

    if (cbcs.complete) return res.status(400).json({ success: false, message: "CBCS already completed" });

    const alreadyExists = cbcs.submissions?.some(s => s.regno === regno);
    if (alreadyExists) return res.status(400).json({ success: false, message: "Already submitted" });

    // Read allocation Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(cbcs.allocation_excel_path);

    for (const sub of subjects) {
      const sheet = workbook.getWorksheet(sub.subject_id);
      if (!sheet) continue;

      const staffRow = sheet.getRow(2);
      let staffColStart = null;
      staffRow.eachCell((cell, colNumber) => {
        if (cell.value && cell.value.toString().startsWith(sub.staff_id)) staffColStart = colNumber;
      });
      if (!staffColStart) continue;

      const regnoCol = staffColStart - 1;
      const nameCol = staffColStart;

      let assignedCount = 0;
      for (let r = 4; r <= sheet.rowCount; r++) {
        if (sheet.getRow(r).getCell(regnoCol).value) assignedCount++;
      }

      const cbcsSub = cbcs.subjects.find(s => s.subject_id === sub.subject_id);
      const staffData = cbcsSub?.staffs.find(st => st.staff_id === sub.staff_id);
      const staffLimit = staffData?.student_limit ?? Infinity;

      if (assignedCount >= staffLimit) {
        return res.status(400).json({
          success: false,
          message: `Staff ${sub.staff_id} has reached limit of ${staffLimit} students`
        });
      }

      let rowToInsert = 4;
      while (sheet.getRow(rowToInsert).getCell(regnoCol).value) rowToInsert++;

      if (rowToInsert > sheet.rowCount) {
        const emptyRow = [];
        for (let i = 1; i <= sheet.columnCount; i++) emptyRow.push("");
        sheet.spliceRows(rowToInsert, 0, emptyRow);
      }

      const row = sheet.getRow(rowToInsert);
      row.getCell(regnoCol).value = regno;
      row.getCell(nameCol).value = name; // or student name if available
      row.commit();
    }

    const tempFilePath = path.join(path.dirname(cbcs.allocation_excel_path), `temp_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(tempFilePath);
    fs.renameSync(tempFilePath, cbcs.allocation_excel_path);

    cbcs.submissions.push({ regno, email, subjects });

    if (cbcs.total_students && cbcs.submissions.length >= cbcs.total_students) {
      cbcs.complete = true;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "esdurgadevi1@gmail.com",
        subject: "Elective CBCS Completed",
        text: `Elective CBCS (${cbcs.cbcs_id}) is complete. Total Students: ${cbcs.total_students}`,
        attachments: [{ filename: `${cbcs.cbcs_id}.xlsx`, path: cbcs.allocation_excel_path }]
      });
    }
    await cbcs.save();
    res.status(200).json({ success: true, message: "Submission successful" });
  } catch (error) {
    console.error("Error submitting elective CBCS:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
// DELETE Elective CBCS
// ------------------------------
export const deleteElectiveCbcs = async (req, res) => {
  try {
    const { cbcs_id } = req.params;
    const cbcs = await ElectiveCbcs.findOne({ cbcs_id });
    if (!cbcs) return res.status(404).json({ success: false, message: "CBCS not found" });

    if (cbcs.allocation_excel_path && fs.existsSync(cbcs.allocation_excel_path)) fs.unlinkSync(cbcs.allocation_excel_path);
    if (cbcs.student_list_excel_path && fs.existsSync(cbcs.student_list_excel_path)) fs.unlinkSync(cbcs.student_list_excel_path);

    await ElectiveCbcs.deleteOne({ cbcs_id });
    res.status(200).json({ success: true, message: "Elective CBCS deleted successfully" });
  } catch (error) {
    console.error("Error deleting elective CBCS:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCbcsStatus = async (req, res) => {
  try {
    const { cbcs_id } = req.params;

    const cbcsData = await ElectiveCbcs.findOne({ cbcs_id });
    if (!cbcsData)
      return res.status(404).json({ success: false, message: "CBCS not found" });

    // ✅ Toggle cbcs
    cbcsData.cbcs = !cbcsData.cbcs;

    // ✅ Save without validating other required fields
    await cbcsData.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `CBCS status updated to ${cbcsData.cbcs}`,
      data: cbcsData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    const { cbcs_id } = req.params;

    const cbcsData = await ElectiveCbcs.findOne({ cbcs_id });
    if (!cbcsData)
      return res.status(404).json({ success: false, message: "CBCS not found" });

    // ✅ Toggle the feedback value
    cbcsData.feedback = !cbcsData.feedback;

    // ✅ Save without validating other required fields
    await cbcsData.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Feedback status updated to ${cbcsData.feedback}`,
      data: cbcsData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingStudents = async (req, res) => {
  try {
    const { cbcs_id } = req.params;
    const format = req.query.format || "json"; // default is JSON

    const cbcsData = await ElectiveCbcs.findOne({ cbcs_id });
    if (!cbcsData)
      return res.status(404).json({ success: false, message: "CBCS not found" });

    // 1️⃣ Read allocation Excel to get submitted regnos
    const allocationWorkbook = new ExcelJS.Workbook();
    await allocationWorkbook.xlsx.readFile(cbcsData.allocation_excel_path);
    const submittedRegnos = new Set();
    allocationWorkbook.worksheets.forEach(sheet => {
      for (let row = 4; row <= sheet.rowCount; row++) {
        const regno = sheet.getRow(row).getCell(1).value;
        if (regno) submittedRegnos.add(regno.toString().trim());
      }
    });

    // 2️⃣ Read student list Excel to get all students
    const studentWorkbook = new ExcelJS.Workbook();
    await studentWorkbook.xlsx.readFile(cbcsData.student_list_excel_path);
    const studentSheet = studentWorkbook.worksheets[0];
    const allStudents = [];
    for (let row = 2; row <= studentSheet.rowCount; row++) {
      const regno = studentSheet.getRow(row).getCell(1).value?.toString().trim();
      const name = studentSheet.getRow(row).getCell(2).value?.toString().trim();
      if (regno && name) allStudents.push({ regno, name });
    }

    // 3️⃣ Filter pending students
    const pendingStudents = allStudents.filter(s => !submittedRegnos.has(s.regno));

    // 4️⃣ Return JSON if format=json
    if (format === "json") {
      return res.status(200).json({
        success: true,
        total_pending: pendingStudents.length,
        data: pendingStudents
      });
    }

    // 5️⃣ Return Excel if format=excel
    if (pendingStudents.length === 0) {
      return res.status(200).json({ success: true, message: "All students submitted CBCS" });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Pending Students");
    sheet.addRow(["Regno", "Name"]);
    pendingStudents.forEach(s => sheet.addRow([s.regno, s.name]));
    sheet.getColumn(1).width = 15;
    sheet.getColumn(2).width = 30;

    const tempFolder = path.join(process.cwd(), "uploads", "pending_students");
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

    const fileName = `pending_students_${cbcs_id}.xlsx`;
    const filePath = path.join(tempFolder, fileName);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, fileName);

  } catch (error) {
    console.error("Error fetching pending students:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitStudentFeedbackBatch = async (req, res) => {
  try {
    const { cbcs_id,regno } = req.params;
    const { feedbacks } = req.body;

    // 1️⃣ Find CBCS record
    const cbcs = await ElectiveCbcs.findOne({ cbcs_id });
    if (!cbcs)
      return res.status(404).json({ success: false, message: "CBCS not found" });

    // 2️⃣ Check if feedback enabled
    if (!cbcs.feedback)
      return res.status(400).json({ success: false, message: "Feedback not enabled" });

    // 3️⃣ Read Excel using ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(cbcs.student_list_excel_path);
    const worksheet = workbook.worksheets[0]; // first sheet

    // Convert rows to array of objects
    const students = [];
    worksheet.eachRow((row) => {
      const regnoCell = row.getCell(1).value; // first column
      const nameCell = row.getCell(2).value;  // optional
      students.push({ regno: regnoCell, name: nameCell });
    });

    // 4️⃣ Check if regno exists
    const studentExists = students.some(
      (s) => s.regno?.toString().trim() === regno.toString().trim()
    );

    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: `Student regno ${regno} NOT found in Excel`,
      });
    }

    // 5️⃣ Check if feedback already submitted
    if (cbcs.feedback_submissions.includes(regno)) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted for this student",
      });
    }

    // 6️⃣ Validate feedback array
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      return res.status(400).json({ success: false, message: "No feedbacks provided" });
    }

    // 7️⃣ Loop through each feedback and call submitFeedback
    const results = [];
    for (const fb of feedbacks) {
      const { staff_id, subject_id, feedback } = fb;
      if (!staff_id || !feedback) {
        results.push({ staff_id, subject_id, status: "failed", error: "Invalid feedback data" });
        continue;
      }

      try {
        // Mock req/res for internal function call
        const mockReq = { params: { staff_id }, body: feedback };
        const mockRes = {
          status: (code) => ({
            json: (data) => results.push({ staff_id, subject_id, status: "failed", error: data.message }),
          }),
          json: (data) => results.push({ staff_id, subject_id, status: "ok", data }),
        };

        await submitFeedback(mockReq, mockRes);

      } catch (err) {
        console.error(`Error for staff ${staff_id}:`, err.message);
        results.push({ staff_id, subject_id, status: "failed", error: err.message });
      }
    }

    // 8️⃣ Mark student as submitted
    cbcs.feedback_submissions.push(regno); // store regno only
    await cbcs.save();

    // 9️⃣ Respond with summary
    return res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      results,
    });

  } catch (err) {
    console.error("Error in submitStudentFeedbackBatch:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
