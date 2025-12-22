// DomainCBCSForm.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiUserPlus, FiBookOpen, FiCopy, FiX } from "react-icons/fi";
import * as XLSX from "xlsx";

const DomainCBCSForm = () => {
  const [formData, setFormData] = useState({
    batchYear: "",
    semester: "",
    domain: "",
    domainId: "",
  });
  const [domains, setDomains] = useState([]);
  const [staffsList, setStaffsList] = useState([]);
  const [isLoadingDomain, setIsLoadingDomain] = useState(true);
  const [error, setError] = useState(null);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [subjectInputs, setSubjectInputs] = useState([
    { id: Date.now(), subject_id: "", subject_name: "", subjects: [], staffs: [] }
  ]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentExcelFile, setStudentExcelFile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cbcsLink, setCbcsLink] = useState("");
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingStaffs, setIsLoadingStaffs] = useState(false);

  // Fetch Domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch("https://cbcs-project.onrender.com/api/domains");
        if (!res.ok) throw new Error("Failed to fetch domains");
        const data = await res.json();
        setDomains(data);
        setIsLoadingDomain(false);
      } catch (err) {
        setError(err.message);
        setIsLoadingDomain(false);
      }
    };
    fetchDomains();
  }, []);

  // Helper: Fetch staff name from staff endpoint
  const fetchStaffName = async (staffId) => {
    try {
      const res = await fetch(`https://cbcs-project.onrender.com/api/staffs/${staffId}`);
      if (!res.ok) throw new Error(`Failed to fetch staff ${staffId}`);
      const data = await res.json();
      return data.name || "Unknown Staff";
    } catch (err) {
      console.error(`Error fetching staff ${staffId}:`, err);
      return "Unknown Staff";
    }
  };

  // Fetch Staffs filtered by domain and get their names
  useEffect(() => {
    const fetchStaffs = async () => {
      if (!formData.domainId) return;
      
      setIsLoadingStaffs(true);
      try {
        const res = await fetch(
          `https://cbcs-project.onrender.com/api/domains/${formData.domainId}/staffs`
        );
        if (!res.ok) throw new Error("Failed to fetch staffs");
        const staffIds = await res.json();
        const staffIdsArray = Array.isArray(staffIds) ? staffIds : [staffIds];

        // Fetch staff names for each staff ID
        const staffsWithNames = await Promise.all(
          staffIdsArray.map(async (staffId) => {
            const staffName = await fetchStaffName(staffId);
            return {
              staff_id: staffId,
              name: staffName
            };
          })
        );

        setStaffsList(staffsWithNames);
      } catch (err) {
        setError(err.message);
        console.error("Error loading staffs:", err);
      } finally {
        setIsLoadingStaffs(false);
      }
    };
    fetchStaffs();
  }, [formData.domainId]);

  // Helper: Fetch subject name from electives endpoint
  const fetchSubjectName = async (subjectId) => {
    try {
      const res = await fetch(`https://cbcs-project.onrender.com/api/electives/${subjectId}`);
      if (!res.ok) throw new Error(`Failed to fetch subject ${subjectId}`);
      const data = await res.json();
      return data.name || "Unknown Subject";
    } catch (err) {
      console.error(`Error fetching subject ${subjectId}:`, err);
      return "Unknown Subject";
    }
  };

  // Helper: Redistribute students among staffs
  const redistributeStudents = (subject) => {
    const numStaff = subject.staffs.length;
    if (numStaff === 0 || totalStudents === 0) return subject.staffs;

    const perStaff = Math.floor(totalStudents / numStaff);
    return subject.staffs.map((stf, idx) => ({
      ...stf,
      student_limit: perStaff + (idx < totalStudents % numStaff ? 1 : 0)
    }));
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStudentExcelFile(file); 
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setTotalStudents(jsonData.length);

      // Redistribute students for existing subjects and staffs
      setSubjectInputs(prev => 
        prev.map(subject => ({
          ...subject,
          staffs: redistributeStudents(subject)
        }))
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDomainSelect = (domain) => {
    setFormData(prev => ({ 
      ...prev, 
      domain: domain.domain_name || domain.name, 
      domainId: domain.domain_id || domain._id 
    }));
    setShowDomainDropdown(false);
    
    // Clear existing subjects when domain changes
    setSubjectInputs([{ id: Date.now(), subject_id: "", subject_name: "", subjects: [], staffs: [] }]);
  };

  const handleLoadSubjects = async (subjectId) => {
    if (!formData.domainId) return;
    
    setIsLoadingSubjects(true);
    try {
      // First, fetch the subject IDs from the domain
      const res = await fetch(
        `https://cbcs-project.onrender.com/api/domains/${formData.domainId}/subjects`
      );
      
      if (!res.ok) throw new Error("Failed to fetch subject IDs");
      
      const subjectIds = await res.json();
      const subjectIdsArray = Array.isArray(subjectIds) ? subjectIds : [subjectIds];

      // Then, fetch subject names for each subject ID
      const subjectsWithNames = await Promise.all(
        subjectIdsArray.map(async (subjectId) => {
          const subjectName = await fetchSubjectName(subjectId);
          return {
            subject_id: subjectId,
            name: subjectName
          };
        })
      );

      // Update the subject inputs with the fetched subjects
      setSubjectInputs(prev =>
        prev.map(s =>
          s.id === subjectId ? { ...s, subjects: subjectsWithNames } : s
        )
      );
    } catch (err) {
      setError(err.message);
      console.error("Error loading subjects:", err);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  // Load subjects for all subject fields when domain changes
  useEffect(() => {
    if (formData.domainId) {
      const loadSubjectsForAllFields = async () => {
        setIsLoadingSubjects(true);
        try {
          // Fetch subject IDs from domain
          const res = await fetch(
            `https://cbcs-project.onrender.com/api/domains/${formData.domainId}/subjects`
          );
          
          if (!res.ok) throw new Error("Failed to fetch subject IDs");
          
          const subjectIds = await res.json();
          const subjectIdsArray = Array.isArray(subjectIds) ? subjectIds : [subjectIds];

          // Fetch subject names for each subject ID
          const subjectsWithNames = await Promise.all(
            subjectIdsArray.map(async (subjectId) => {
              const subjectName = await fetchSubjectName(subjectId);
              return {
                subject_id: subjectId,
                name: subjectName
              };
            })
          );

          // Update all subject fields with the fetched subjects
          setSubjectInputs(prev =>
            prev.map(s => ({
              ...s,
              subjects: subjectsWithNames
            }))
          );
        } catch (err) {
          setError(err.message);
          console.error("Error loading subjects:", err);
        } finally {
          setIsLoadingSubjects(false);
        }
      };

      loadSubjectsForAllFields();
    }
  }, [formData.domainId]);

  const addSubjectField = () => setSubjectInputs(prev => 
    [...prev, { 
      id: Date.now(), 
      subject_id: "", 
      subject_name: "", 
      subjects: subjectInputs[0]?.subjects || [], // Copy subjects from first field
      staffs: [] 
    }]
  );

  const removeSubjectField = (id) => setSubjectInputs(prev => prev.filter(s => s.id !== id));

  const addStaffToSubject = (subjectId) => {
    setSubjectInputs(prev =>
      prev.map(s => {
        if (s.id === subjectId) {
          const newStaffs = [...s.staffs, { staff_id: "", staff_name: "", student_limit: 0 }];
          return { ...s, staffs: redistributeStudents({ ...s, staffs: newStaffs }) };
        }
        return s;
      })
    );
  };

  const removeStaffFromSubject = (subjectId, staffIndex) => {
    setSubjectInputs(prev =>
      prev.map(s => {
        if (s.id === subjectId) {
          const filteredStaffs = s.staffs.filter((_, idx) => idx !== staffIndex);
          return { ...s, staffs: redistributeStudents({ ...s, staffs: filteredStaffs }) };
        }
        return s;
      })
    );
  };

  const handleStaffChange = (subjectId, staffIndex, selectedStaffId) => {
    const selectedStaff = staffsList.find(st => st.staff_id === selectedStaffId);
    setSubjectInputs(prev =>
      prev.map(s => {
        if (s.id === subjectId) {
          const updatedStaffs = s.staffs.map((stf, idx) =>
            idx === staffIndex
              ? { 
                  ...stf,
                  staff_id: selectedStaff?.staff_id || "",
                  staff_name: selectedStaff?.name || ""
                }
              : stf
          );
          return { ...s, staffs: updatedStaffs };
        }
        return s;
      })
    );
  };

  const getTotalAssignedStudents = (staffs) => {
    return staffs.reduce((total, staff) => total + (staff.student_limit || 0), 0);
  };

  const handleStudentCountChange = (subjectId, staffIndex, value) => {
    const newCount = parseInt(value) || 0;
    setSubjectInputs(prev =>
      prev.map(s => {
        if (s.id === subjectId) {
          const newStaffs = s.staffs.map((stf, idx) =>
            idx === staffIndex ? { ...stf, student_limit: newCount } : stf
          );
          const totalAssigned = getTotalAssignedStudents(newStaffs);
          if (totalStudents > 0 && totalAssigned > totalStudents) {
            alert(`Total assigned students (${totalAssigned}) cannot exceed total students (${totalStudents})`);
            return s;
          }
          return { ...s, staffs: newStaffs };
        }
        return s;
      })
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cbcsLink)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  let isValid = true;

  // 1️⃣ Validate total students allocation
  subjectInputs.forEach(subject => {
    const totalAssigned = getTotalAssignedStudents(subject.staffs);
    if (totalStudents > 0 && totalAssigned > totalStudents) {
      isValid = false;
      alert(
        `Error: Subject "${subject.subject_name}" has ${totalAssigned} students assigned, 
        but only ${totalStudents} total students available.`
      );
    }
  });
  if (!isValid) return;

  // 2️⃣ Prepare payload for backend
  const payload = {
    cbcs_id: `CBCS-${Date.now()}`,
    batch: formData.batchYear,
    domain: formData.domain,
    semester: Number(formData.semester),
    total_students: totalStudents,
    subjects: subjectInputs.map((sub) => ({
      subject_id: sub.subject_id,
      name: sub.subject_name,
      staffs: sub.staffs.map((stf) => ({
        staff_id: stf.staff_id,
        staff_name: stf.staff_name,
        student_limit: stf.student_limit
      }))
    }))
  };

  try {
    const formDataObj = new FormData();
    formDataObj.append("data", JSON.stringify(payload));
    if (studentExcelFile) formDataObj.append("student_excel", studentExcelFile);

    // ✅ Correct API route
    const res = await fetch("https://cbcs-project.onrender.com/api/elective-cbcs", {
      method: "POST",
      body: formDataObj,
    });

    if (!res.ok) throw new Error(`Failed to create CBCS: ${res.status}`);

    const data = await res.json();
    console.log("Response:", data);

    // ✅ Show success modal with the generated link
    if (data?.data?.cbcs_link) {
      setCbcsLink(data.data.cbcs_link);
      setShowSuccessModal(true);
    } else {
      alert("CBCS created successfully!");
    }
  } catch (error) {
    console.error("Error creating CBCS:", error);
    alert("Something went wrong while saving CBCS");
  }
};


  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-600">CBCS Created Successfully!</h3>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Share this link with students for course selection:
              </p>
              
              <div className="flex items-center mb-6 p-3 bg-gray-100 rounded-lg">
                <input 
                  type="text" 
                  readOnly 
                  value={cbcsLink} 
                  className="flex-1 bg-transparent outline-none text-sm truncate"
                />
                <button 
                  onClick={copyToClipboard}
                  className="ml-2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center"
                >
                  <FiCopy className="mr-1" /> Copy
                </button>
              </div>
              
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Elective CBCS Course Management</h1>
          <p className="text-gray-600">Select batch, domain, semester, subjects, and teaching staff</p>
        </div>
        <motion.div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-purple-500 to-blue-500">
            <div className="bg-white rounded-xl p-6 sm:p-8">
              <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <input 
                      type="text" 
                      name="batchYear" 
                      placeholder="Batch Year e.g. 2023" 
                      value={formData.batchYear} 
                      onChange={handleInputChange} 
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 w-full" 
                      required 
                    />
                    
                    <div className="relative">
                      <button 
                        type="button" 
                        onClick={() => setShowDomainDropdown(!showDomainDropdown)} 
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      >
                        {formData.domain || "Select Domain"}
                        {showDomainDropdown ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                      <AnimatePresence>
                        {showDomainDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }} 
                            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          >
                            {isLoadingDomain ? (
                              <div className="px-4 py-3 text-gray-500">Loading domains...</div>
                            ) : (
                              domains.map(domain => (
                                <button 
                                  key={domain.domain_id || domain._id} 
                                  type="button" 
                                  className="w-full text-left px-4 py-3 hover:bg-purple-50" 
                                  onClick={() => handleDomainSelect(domain)}
                                >
                                  {domain.domain_name || domain.name}
                                </button>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <select 
                      name="semester" 
                      value={formData.semester} 
                      onChange={handleInputChange} 
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500" 
                      required
                    >
                      <option value="">Select Semester</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{`Semester ${s}`}</option>)}
                    </select>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block mb-2 text-gray-700 font-medium">Upload Student List (Excel)</label>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls" 
                      onChange={handleExcelUpload} 
                      className="block w-full text-gray-700 border border-gray-300 rounded-lg cursor-pointer p-2"
                    />
                    {totalStudents > 0 && (
                      <p className="mt-2 text-green-600 font-medium">✅ Total Students: {totalStudents}</p>
                    )}
                  </div>
                </div>

                {/* Subjects */}
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FiBookOpen className="mr-2 text-purple-500" />
                      Subjects & Staff
                      {isLoadingSubjects && (
                        <span className="ml-2 text-sm text-gray-500">Loading subjects...</span>
                      )}
                      {isLoadingStaffs && (
                        <span className="ml-2 text-sm text-gray-500">Loading staffs...</span>
                      )}
                    </h2>
                    <button 
                      type="button" 
                      onClick={addSubjectField} 
                      className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      disabled={!formData.domainId || isLoadingStaffs}
                    >
                      <FiPlus className="mr-2"/>
                      Add Subject
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <AnimatePresence>
                      {subjectInputs.map((sub, idx) => {
                        const totalAssigned = getTotalAssignedStudents(sub.staffs);
                        const isOverLimit = totalStudents > 0 && totalAssigned > totalStudents;
                        
                        return (
                          <motion.div 
                            key={sub.id} 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: "auto" }} 
                            exit={{ opacity: 0, height: 0 }} 
                            transition={{ duration: 0.3 }} 
                            className="p-6 bg-gray-50 rounded-xl border border-gray-200"
                          >
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-medium text-gray-700">Subject {idx + 1}</h3>
                              {subjectInputs.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => removeSubjectField(sub.id)} 
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <select
                                value={sub.subject_id}
                                onChange={(e) => {
                                  const selectedSubject = sub.subjects.find(sb => sb.subject_id === e.target.value);
                                  setSubjectInputs(prev => prev.map(s =>
                                    s.id === sub.id ? { 
                                      ...s, 
                                      subject_id: selectedSubject?.subject_id || "",
                                      subject_name: selectedSubject?.name || "" 
                                    } : s
                                  ));
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                disabled={sub.subjects.length === 0 || isLoadingSubjects}
                              >
                                <option value="">Select Subject</option>
                                {sub.subjects.map(subject => (
                                  <option key={subject.subject_id} value={subject.subject_id}>
                                    {subject.name}
                                  </option>
                                ))}
                              </select>
                              
                              <button 
                                type="button" 
                                onClick={() => handleLoadSubjects(sub.id)} 
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                                disabled={!formData.domainId || isLoadingSubjects}
                              >
                                {isLoadingSubjects ? "Loading..." : "Reload Subjects"}
                              </button>
                            </div>

                            {/* Staff */}
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-gray-700">Teaching Staff</h4>
                                <button 
                                  type="button" 
                                  onClick={() => addStaffToSubject(sub.id)} 
                                  className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                  disabled={!sub.subject_id || isLoadingStaffs}
                                >
                                  <FiUserPlus className="mr-1" />
                                  Add Staff
                                </button>
                              </div>
                              
                              <div className="space-y-3">
                                <AnimatePresence>
                                  {sub.staffs.map((stf, index) => (
                                    <motion.div 
                                      key={index} 
                                      initial={{ opacity: 0, x: -20 }} 
                                      animate={{ opacity: 1, x: 0 }} 
                                      exit={{ opacity: 0, x: 20 }} 
                                      className="flex items-center space-x-3"
                                    >
                                      <select 
                                        value={stf.staff_id} 
                                        onChange={e => handleStaffChange(sub.id, index, e.target.value)} 
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        disabled={isLoadingStaffs}
                                      >
                                        <option value="">Select Staff</option>
                                        {staffsList.map(st => (
                                          <option key={st.staff_id} value={st.staff_id}>
                                            {st.name}
                                          </option>
                                        ))}
                                      </select>

                                      <div className="flex items-center">
                                        <span className="text-gray-600 mr-2">Students:</span>
                                        <input
                                          type="number"
                                          min="0"
                                          max={totalStudents}
                                          value={stf.student_limit}
                                          onChange={e => handleStudentCountChange(sub.id, index, e.target.value)}
                                          className="w-20 px-2 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      
                                      <button 
                                        type="button" 
                                        onClick={() => removeStaffFromSubject(sub.id, index)} 
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                                
                                {totalStudents > 0 && (
                                  <div className={`mt-2 text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                                    Total assigned: {totalAssigned} / {totalStudents} students
                                    {isOverLimit && ' (Exceeds available students!)'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600"
                  disabled={isLoadingSubjects || isLoadingStaffs}
                >
                  {(isLoadingSubjects || isLoadingStaffs) ? "Loading..." : "Submit Form"}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DomainCBCSForm;