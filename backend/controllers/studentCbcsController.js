import StudentCbcs from "../models/studentCbcsModel.js";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { submitFeedback } from "./staffController.js"; // import the staff feedback controller

// POST - Create CBCS + Generate Excel
export const createCbcs = async (req, res) => {
  try {
    // ✅ STEP 1: Parse form-data JSON
    const bodyData = JSON.parse(req.body.data);

    // ✅ STEP 2: Create new model instance (not saving yet)
    const newCbcs = new StudentCbcs({
      cbcs_id: bodyData.cbcs_id,
      batch: bodyData.batch,
      department: bodyData.department,
      semester: bodyData.semester,
      subjects: bodyData.subjects,
      allocation_excel_path: "",     
      student_list_excel_path: "",    
      cbcs_link: "", 
      total_students:0,   
      submissions:[],              
      complete: false
    });

    // ✅ STEP 3: Generate allocation Excel with the requested format
    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = 'CBCS Management System';
    workbook.lastModifiedBy = 'CBCS Management System';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Define color palette with requested colors
    const colors = {
      subjectHeader: 'FFFFFF00', // Yellow for subject header (as requested)
      columnHeader: 'FFFF7F66',  // Coral for Regno/Student Name headers (as requested)
      staffHeader: 'FFDDEBF7',   // Light blue for staff headers
      lightGray: 'FFF2F2F2',
      borderGray: 'FFD9D9D9',
      textDark: 'FF000000',
      textWhite: 'FFFFFFFF'
    };

    for (const subject of bodyData.subjects) {
      const sheet = workbook.addWorksheet(`${subject.subject_id}`);
      
      // Add subject header with styling (Row 1)
      const subjectHeaderRow = sheet.addRow([`Subject: ${subject.subject_id} - ${subject.name || 'Subject'}`]);
      
      // Merge cells for the subject header across all columns
      const totalColumns = subject.staffs.length * 2;
      sheet.mergeCells(1, 1, 1, totalColumns);
      
      // Style subject header with requested color (FFFFFF00 - Yellow)
      subjectHeaderRow.eachCell((cell) => {
        cell.font = { 
          bold: true, 
          size: 14, 
          color: { argb: colors.textDark } 
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.subjectHeader } // FFFFFF00 - Yellow
        };
        cell.border = {
          top: { style: 'medium', color: { argb: colors.borderGray } },
          left: { style: 'medium', color: { argb: colors.borderGray } },
          bottom: { style: 'medium', color: { argb: colors.borderGray } },
          right: { style: 'medium', color: { argb: colors.borderGray } }
        };
      });

      // Create staff headers row (Row 2)
      const staffHeaders = [];
      subject.staffs.forEach((staff) => {
        staffHeaders.push(`${staff.staff_id} - ${staff.staff_name}`);
        staffHeaders.push(''); // Empty cell for the second column of the same staff
      });
      
      const staffHeaderRow = sheet.addRow(staffHeaders);
      
      // Style staff headers and merge cells (using light blue)
      let columnIndex = 1;
      subject.staffs.forEach((staff) => {
        const staffCell = staffHeaderRow.getCell(columnIndex);
        const nextCell = staffHeaderRow.getCell(columnIndex + 1);
        
        // Merge cells for each staff
        sheet.mergeCells(2, columnIndex, 2, columnIndex + 1);
         
        // Style the merged staff header with light blue
        staffCell.font = { 
          bold: true, 
          size: 12, 
          color: { argb: colors.textDark } 
        };
        staffCell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle' 
        };
        staffCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.staffHeader } // Light blue
        };
        staffCell.border = {
          top: { style: 'medium', color: { argb: colors.borderGray } },
          left: { style: 'thin', color: { argb: colors.borderGray } },
          bottom: { style: 'thin', color: { argb: colors.borderGray } },
          right: { style: 'thin', color: { argb: colors.borderGray } }
        };
        
        // Style the next cell (empty) to maintain borders
        nextCell.border = {
          top: { style: 'medium', color: { argb: colors.borderGray } },
          left: { style: 'thin', color: { argb: colors.borderGray } },
          bottom: { style: 'thin', color: { argb: colors.borderGray } },
          right: { style: 'thin', color: { argb: colors.borderGray } }
        };
        
        columnIndex += 2;
      });

      // Create column headers row (Row 3)
      const columnHeaders = [];
      subject.staffs.forEach(() => {
        columnHeaders.push('Regno', 'Student\'s Name');
      });
      
      const columnHeaderRow = sheet.addRow(columnHeaders);
      
      // Style column headers with requested color (FFFF7F66 - Coral)
      columnHeaderRow.eachCell((cell, colNumber) => {
        cell.font = { 
          bold: true, 
          color: { argb: colors.textDark },
          size: 11
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle' 
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.columnHeader } // FFFF7F66 - Coral
        };
        cell.border = {
          top: { style: 'thin', color: { argb: colors.borderGray } },
          left: { style: 'thin', color: { argb: colors.borderGray } },
          bottom: { style: 'medium', color: { argb: colors.borderGray } },
          right: { style: 'thin', color: { argb: colors.borderGray } }
        };
      });

      // Add empty student rows (initially 10 empty rows)
      for (let i = 0; i < 10; i++) {
        const emptyRow = [];
        subject.staffs.forEach(() => {
          emptyRow.push('', '');
        });
        const dataRow = sheet.addRow(emptyRow);
        
        // Style the empty data rows with alternating colors
        dataRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: colors.borderGray } },
            left: { style: 'thin', color: { argb: colors.borderGray } },
            bottom: { style: 'thin', color: { argb: colors.borderGray } },
            right: { style: 'thin', color: { argb: colors.borderGray } }
          };
          
          // Alternate row colors for better readability
          if (dataRow.number % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: colors.lightGray }
            };
          }
        });
      }

      // Set column widths for better readability
      subject.staffs.forEach((staff, index) => {
        const regnoCol = index * 2 + 1;
        const nameCol = regnoCol + 1;
        
        sheet.getColumn(regnoCol).width = 15; // Regno column
        sheet.getColumn(nameCol).width = 30; // Student Name column
      });

      // Freeze the header rows (subject header + staff headers + column headers)
      sheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 3 }
      ];
    }

    // ✅ STEP 4: Save allocation Excel file
    const folderPath = path.join(process.cwd(), "uploads", "cbcs_excels");
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    const allocationExcelName = `cbcs_allocation_${newCbcs.cbcs_id}.xlsx`;
    const allocationExcelPath = path.join(folderPath, allocationExcelName);
    await workbook.xlsx.writeFile(allocationExcelPath);
    let totalStudents = 0;
    // ✅ STEP 5: Handle Student List Upload (if provided)
    let studentListPath = "";
    if (req.file) {
      const studentListFolder = path.join(process.cwd(), "uploads", "student_list");
      if (!fs.existsSync(studentListFolder)) fs.mkdirSync(studentListFolder, { recursive: true });

      const studentListName = `student_list_${newCbcs.cbcs_id}${path.extname(req.file.originalname)}`;
      studentListPath = path.join(studentListFolder, studentListName);
      fs.renameSync(req.file.path, studentListPath);

        // ✅ Read Excel and count student rows
      const studentWorkbook = new ExcelJS.Workbook();
      await studentWorkbook.xlsx.readFile(studentListPath);
      // Assuming first sheet contains student list
      const studentSheet = studentWorkbook.worksheets[0];
      // Count rows excluding header row (row 1)
      totalStudents = studentSheet.rowCount - 1;

    }

    // ✅ STEP 6: Fill fields now
    //http://localhost:5173/cbcs/elective/${newCbcs.cbcs_id}
    const cbcsLink = `http://localhost:5173/cbcs/core/${newCbcs.cbcs_id}`;
    newCbcs.allocation_excel_path = allocationExcelPath;
    newCbcs.student_list_excel_path = studentListPath || "";
    newCbcs.cbcs_link = cbcsLink;
    newCbcs.total_students = totalStudents;
    // ✅ STEP 7: Save to DB
    await newCbcs.save();

    res.status(201).json({
      success: true,
      message: "CBCS created successfully with files",
      data: newCbcs,
    });

  } catch (error) {
    console.error("Error creating CBCS:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};



// GET - Get All CBCS
export const getAllCbcs = async (req, res) => {
  try {
    const allCbcs = await StudentCbcs.find();
    res.status(200).json({ success: true, data: allCbcs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET - Get CBCS by cbcs_id
export const getCbcsById = async (req, res) => {
  try {
    const cbcs = await StudentCbcs.findOne({ cbcs_id: req.params.id });
    if (!cbcs) {
      return res.status(404).json({ success: false, message: "CBCS not found" });
    }
    res.status(200).json({ success: true, data: cbcs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//submit student
export const submitStudentCbcs = async (req, res) => {
  try {
    const { cbcs_id, regno, name, email, subjects } = req.body;

    const cbcs = await StudentCbcs.findOne({ cbcs_id });
    if (!cbcs)
      return res.status(404).json({ success: false, message: "CBCS not found" });

    if (cbcs.complete) {
      return res
        .status(400)
        .json({ success: false, message: "CBCS already completed!" });
    }

    const alreadyExists = cbcs.submissions?.some((s) => s.regno === regno);
    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "You already filled the CBCS successfully",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(cbcs.allocation_excel_path);

    for (const sub of subjects) {
      const sheet = workbook.getWorksheet(sub.subject_id);
      if (!sheet) continue;

      // ✅ Find staff column start by staff_id in Row 2
      const staffRow = sheet.getRow(2);
      let staffColStart = null;

      staffRow.eachCell((cell, colNumber) => {
        if (cell.value && cell.value.toString().trim().startsWith(sub.staff_id)) {
          staffColStart = colNumber;
        }
      });

      if (!staffColStart) continue; // staff not found in this sheet

      const regnoCol = staffColStart - 1; // Regno column for that staff
      const nameCol = staffColStart; // Student's Name column (right next to Regno)

      // ✅ Count already assigned students under this staff
      let assignedCount = 0;
      for (let r = 4; r <= sheet.rowCount; r++) {
        const regCell = sheet.getRow(r).getCell(regnoCol).value;
        if (regCell) assignedCount++;
      }

      // ✅ Find staff_limit from cbcs.subjects
      const cbcsSub = cbcs.subjects.find((s) => s.subject_id === sub.subject_id);
      const staffData = cbcsSub?.staffs.find((st) => st.staff_id === sub.staff_id);
      const staffLimit = staffData?.student_limit ?? Infinity;

      if (assignedCount >= staffLimit) {
        return res.status(400).json({
          success: false,
          message: `Staff ${sub.staff_id} has reached the limit of ${staffLimit} students.`,
        });
      }

      // ✅ Find first empty row under this staff
      let rowToInsert = 4;
      while (sheet.getRow(rowToInsert).getCell(regnoCol).value) {
        rowToInsert++;
      }

      // ✅ Only insert a new row if we are beyond the current rowCount
      if (rowToInsert > sheet.rowCount) {
        const emptyRow = [];
        for (let i = 1; i <= sheet.columnCount; i++) emptyRow.push("");
        sheet.spliceRows(rowToInsert, 0, emptyRow);
      }

      // ✅ Write data into that row
      const row = sheet.getRow(rowToInsert);
      row.getCell(regnoCol).value = regno;
      row.getCell(nameCol).value = name;
      row.commit();
    }

    // ✅ Write to temp file then replace original
    const tempFilePath = path.join(
      path.dirname(cbcs.allocation_excel_path),
      `temp_${Date.now()}.xlsx`
    );
    await workbook.xlsx.writeFile(tempFilePath);
    fs.renameSync(tempFilePath, cbcs.allocation_excel_path);

    // ✅ Save submission in DB
    if (!cbcs.submissions) cbcs.submissions = [];
    cbcs.submissions.push({ regno, email, subjects });

    // ✅ Check if all students have submitted
    if (cbcs.total_students && cbcs.submissions.length >= cbcs.total_students) {
      cbcs.complete = true;

      // ✅ Send mail once CBCS completed
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "esdurgadevi1@gmail.com", // change as needed
        subject: "CBCS Completed",
        text: `CBCS (${cbcs.cbcs_id}) is now complete. Total Students: ${cbcs.total_students}`,
        attachments:[
          {
            filename:`${cbcs.cbcs_id}.xlsx`,
            path:cbcs.allocation_excel_path,
          }
        ]
      });
    }

    await cbcs.save();

    res
      .status(200)
      .json({ success: true, message: "CBCS submitted successfully" });
  } catch (error) {
    console.error("Error submitting CBCS:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE CBCS by cbcs_id
export const deleteCbcs = async (req, res) => {
  try {
    const { cbcs_id } = req.params;
    // Find CBCS by ID
    const cbcs = await StudentCbcs.findOne({ cbcs_id });
    if (!cbcs) {
      return res.status(404).json({ success: false, message: "CBCS not found" });
    }

    // Delete allocation Excel if exists
    if (cbcs.allocation_excel_path && fs.existsSync(cbcs.allocation_excel_path)) {
      fs.unlinkSync(cbcs.allocation_excel_path);
    }

    // Delete student list Excel if exists
    if (cbcs.student_list_excel_path && fs.existsSync(cbcs.student_list_excel_path)) {
      fs.unlinkSync(cbcs.student_list_excel_path);
    }

    // Delete CBCS record from DB
    await StudentCbcs.deleteOne({ cbcs_id });

    res.status(200).json({ success: true, message: "CBCS deleted successfully" });
  } catch (error) {
    console.error("Error deleting CBCS:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCbcsStatus = async (req, res) => {
  try {
    const { cbcs_id } = req.params;

    const cbcsData = await StudentCbcs.findOne({ cbcs_id });
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

    const cbcsData = await StudentCbcs.findOne({ cbcs_id });
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

    const cbcsData = await StudentCbcs.findOne({ cbcs_id });
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

// export const submitStudentFeedbackBatch = async (req, res) => {
//   try {
//     const { cbcs_id } = req.params;
//     const { regno, feedbacks } = req.body; // feedbacks: [{ subject_id, staff_id, ratings }]

//     // 1️⃣ Find CBCS
//     const cbcs = await StudentCbcs.findOne({ cbcs_id });
//     if (!cbcs) return res.status(404).json({ success: false, message: "CBCS not found" });

//     // 2️⃣ Check feedback enabled
//     if (!cbcs.feedback)
//       return res.status(400).json({ success: false, message: "Feedback not enabled" });

//     // 3️⃣ Check student exists in Excel
//     const workbook = XLSX.readFile(cbcs.student_list_excel_path);
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const students = XLSX.utils.sheet_to_json(sheet);
//     const studentExists = students.some((s) => s.regno === regno);
//     if (!studentExists)
//       return res.status(400).json({ success: false, message: "Student not in list" });

//     // 4️⃣ Prevent duplicate submission
//     if (cbcs.feedback_submissions.includes(regno))
//       return res.status(400).json({ success: false, message: "Feedback already submitted" });

//     // 5️⃣ Validate feedback array
//     if (!Array.isArray(feedbacks) || feedbacks.length === 0)
//       return res.status(400).json({ success: false, message: "No feedbacks provided" });

//     // 6️⃣ Submit feedback for each subject/staff
//     const results = [];
//     for (const fb of feedbacks) {
//       const { staff_id, subject_id, ratings } = fb;
//       if (!staff_id || !subject_id || !ratings) continue;

//       try {
//         const mockReq = { params: { staff_id }, body: ratings };
//         const mockRes = {
//           json: (data) => results.push({ staff_id, subject_id, status: "ok", data }),
//           status: (code) => ({
//             json: (data) => results.push({ staff_id, subject_id, status: "failed", error: data.message }),
//           }),
//         };

//         await submitFeedback(mockReq, mockRes);

//         // Optional: Track per student submission in CBCS
//         let submission = cbcs.submissions.find((s) => s.regno === regno);
//         if (!submission) {
//           submission = { regno, email: "", subjects: [] };
//           cbcs.submissions.push(submission);
//         }
//         submission.subjects.push({ subject_id, staff_id });

//       } catch (err) {
//         console.error(`Feedback error for staff ${staff_id}:`, err.message);
//         results.push({ staff_id, subject_id, status: "failed", error: err.message });
//       }
//     }

//     // 7️⃣ Mark student as submitted
//     cbcs.feedback_submissions.push(regno);
//     await cbcs.save();

//     // 8️⃣ Respond with summary
//     res.status(200).json({
//       success: true,
//       message: "Feedback submitted successfully",
//       results,
//     });
//   } catch (err) {
//     console.error("Error in submitStudentFeedbackBatch:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };




export const submitStudentFeedbackBatch = async (req, res) => {
  try {
    const { cbcs_id,regno } = req.params;
    const { feedbacks } = req.body;

    // 1️⃣ Find CBCS record
    const cbcs = await StudentCbcs.findOne({ cbcs_id });
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



