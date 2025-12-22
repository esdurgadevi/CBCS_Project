import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBook, FiUser, FiUsers, FiChevronDown, FiCheck,
  FiSend, FiAward, FiCalendar, FiBookOpen, FiStar,
  FiCheckCircle, FiXCircle, FiInfo, FiMail, FiHash
} from 'react-icons/fi';

const StudentCbcs = () => {
  const { type,id,regno } = useParams();
  const [cbcsData, setCbcsData] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);

  // Fetch student information based on regno
  const fetchStudentInfo = async () => {
    try {
      setStudentLoading(true);
      const response = await fetch(`https://cbcs-project.onrender.com/api/otp/student/${regno}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch student data: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch student data');
      }

      setStudentInfo(result.data);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setStudentLoading(false);
    }
  };

  const fetchCbcsData = async () => {
    try {
      console.log(id);
      const apiUrl = 
           type === 'elective'
           ? `https://cbcs-project.onrender.com/api/elective-cbcs/${id}`
           : `https://cbcs-project.onrender.com/api/student_cbcs/${id}`
      setLoading(true);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CBCS data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch CBCS data');
      }

      setCbcsData(result.data);

      // Initialize selections object
      const initialSelections = {};
      result.data.subjects.forEach(subject => {
        initialSelections[subject.subject_id] = {};
      });
      setSelections(initialSelections);

    } catch (err) {
      console.error('Error fetching CBCS data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && regno) {
      fetchCbcsData();
      fetchStudentInfo();
    } else {
      setError('No CBCS ID or Registration Number provided in URL');
      setLoading(false);
      setStudentLoading(false);
    }
  }, [id, regno]);

  const handleStaffSelection = (subjectId, staffId, studentLimit, assignedCount) => {
    if (assignedCount >= studentLimit) return;
    
    setSelections(prev => ({
      ...prev,
      [subjectId]: {
        staffId,
        studentLimit
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!studentInfo) {
        throw new Error("Student information not available. Please try refreshing the page.");
      }

      const payload = {
        cbcs_id: cbcsData.cbcs_id,
        regno: studentInfo.regno || regno,
        name: studentInfo.name || "Student",
        email: studentInfo.email || `${regno}@nec.edu.in`,
        subjects: Object.entries(selections).map(([subject_id, data]) => ({
          subject_id,
          staff_id: data.staffId
        }))
      };
      //console.log(regno+" "+name+" "+email);
      const apiUrl1 = 
           type === 'elective'
           ? `https://cbcs-project.onrender.com/api/elective-cbcs/stu/${id}`
           : `https://cbcs-project.onrender.com/api/student_cbcs/stu/${id}`
      
      const res = await fetch(apiUrl1, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to submit CBCS");

      setSubmitted(true);
      fetchCbcsData();
      setTimeout(() => setSubmitted(false), 3000);

    } catch (err) {
      alert(err.message);
    }
  };

  const toggleSubjectExpand = (subjectId) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  const isSelectionComplete = () => {
    return cbcsData && cbcsData.subjects.every(subject => selections[subject.subject_id]?.staffId);
  };

  const hasStudentSubmitted = () => {
    if (!cbcsData || !studentInfo) return false;
    return cbcsData.submissions.some(sub => sub.regno === (studentInfo.regno || regno));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 via-blue-600 to-green-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 20}px`,
                height: `${Math.random() * 100 + 20}px`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="text-center relative z-10">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <FiAward className="text-4xl text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Loading Your CBCS Portal
          </motion.h1>
          <p className="text-blue-200">Preparing your course selection experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 via-blue-600 to-green-500 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-400/30"
            >
              <FiXCircle className="text-4xl text-red-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">Oops! Something went wrong</h2>
            <p className="text-blue-200 mb-6">{error}</p>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setError(null);
                if (id && regno) {
                  fetchCbcsData();
                  fetchStudentInfo();
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg"
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!cbcsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <p className="text-white text-lg font-semibold">No CBCS data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Enhanced Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl mb-6"
          >
            <FiAward className="text-3xl text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">
            Choice Based Credit System
          </h1>
          
          {/* Combined Student and CBCS Information Card */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Information */}
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                    <FiUser className="text-xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Student Information</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2"></div>
                  </div>
                </div>
                
                {studentInfo && (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FiUser className="text-blue-300 mr-3 w-5" />
                      <div>
                        <p className="text-white font-medium">{studentInfo.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiHash className="text-blue-300 mr-3 w-5" />
                      <div>
                        <p className="text-yellow-300 font-medium">{studentInfo.regno}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiMail className="text-blue-300 mr-3 w-5" />
                      <div>
                        <p className="text-blue-300 font-medium">{studentInfo.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CBCS Information */}
              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                    <FiBookOpen className="text-xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">CBCS Details</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mt-2"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FiCalendar className="text-blue-300 mr-3 w-5" />
                    <div>
                      <p className="text-white font-medium">Y{cbcsData.batch} | Semester {cbcsData.semester}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiBook className="text-blue-300 mr-3 w-5" />
                    <div>
                      <p className="text-yellow-300 font-medium">{cbcsData.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiHash className="text-blue-300 mr-3 w-5" />
                    <div>
                      <p className="text-blue-300 font-medium">{cbcsData.cbcs_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Submission Status */}
        {hasStudentSubmitted() && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-green-500/90 to-emerald-600/90 rounded-2xl p-6 text-center shadow-xl border border-emerald-400/30"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <FiCheckCircle className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Selections Submitted Successfully!</h3>
              <p className="text-blue-100 text-lg">Your choices have been recorded and cannot be modified.</p>
            </div>
          </motion.div>
        )}

        {/* Progress indicator - Only show if not submitted */}
        {!hasStudentSubmitted() && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-medium text-lg">Selection Progress</span>
              <span className="text-yellow-300 font-bold text-xl">
                {Object.values(selections).filter(s => s.staffId).length}/{cbcsData.subjects.length}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(Object.values(selections).filter(s => s.staffId).length / cbcsData.subjects.length) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 shadow-lg"
              ></motion.div>
            </div>
            <p className="text-sm text-gray-300 mt-3">
              Complete all subject selections to submit your preferences
            </p>
          </motion.div>
        )}

        {/* Subject + Staff selection */}
        {!hasStudentSubmitted() && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          >
            {cbcsData.subjects.map((subject, index) => (
              <motion.div 
                key={subject.subject_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="p-6 border-b border-white/10 last:border-b-0"
              >
                <div 
                  className="flex justify-between items-center cursor-pointer group"
                  onClick={() => toggleSubjectExpand(subject.subject_id)}
                >
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl mr-5 shadow-lg">
                      <FiBook className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">{subject.subject_id} - {subject.name}</h3>
                      <p className={`text-sm ${selections[subject.subject_id]?.staffId ? 'text-green-300' : 'text-blue-300'}`}>
                        {selections[subject.subject_id]?.staffId ? '✓ Selection made' : 'Pending selection'}
                      </p>
                    </div>
                  </div>
                  <motion.div 
                    animate={{ rotate: expandedSubject === subject.subject_id ? 180 : 0, y: expandedSubject === subject.subject_id ? 2 : 0 }}
                    className="text-white text-2xl group-hover:text-yellow-300 transition-colors"
                  >
                    <FiChevronDown />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {expandedSubject === subject.subject_id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 space-y-4"
                    >
                      <div className="text-white/80 text-sm flex items-center">
                        <FiInfo className="mr-2" /> Select your preferred faculty member
                      </div>
                      
                      {subject.staffs.map((staff, staffIndex) => {
                        const assignedCount = cbcsData.submissions.filter(s => 
                          s.subjects.some(sub => sub.subject_id === subject.subject_id && sub.staff_id === staff.staff_id)
                        ).length;

                        const isFull = assignedCount >= staff.student_limit;
                        const isSelected = selections[subject.subject_id]?.staffId === staff.staff_id;
                        const percentageFull = Math.round((assignedCount / staff.student_limit) * 100);

                        return (
                          <motion.div
                            key={staff.staff_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: staffIndex * 0.1 }}
                            className={`p-5 rounded-2xl border-2 flex justify-between items-center transition-all duration-300
                              ${isFull ? "bg-red-500/10 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 cursor-pointer"}
                              ${isSelected ? "border-blue-400 bg-blue-500/20 shadow-lg" : "border-white/10"}`}
                            onClick={() => !isFull && handleStaffSelection(subject.subject_id, staff.staff_id, staff.student_limit, assignedCount)}
                          >
                            <div className="flex items-center">
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-5 shadow-md ${
                                isSelected ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-700'
                              }`}>
                                <FiUser className="text-white text-xl" />
                              </div>
                              <div>
                                <p className="font-semibold text-white text-lg">{staff.staff_name}</p>
                                <p className="text-sm text-blue-300">ID: {staff.staff_id}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full mb-2 ${
                                isFull ? "bg-red-500 text-white" : "bg-green-500 text-white"
                              }`}>
                                {assignedCount}/{staff.student_limit}
                              </span>
                              <div className="w-24 h-2 bg-gray-700 rounded-full">
                                <div 
                                  className={`h-2 rounded-full ${
                                    percentageFull >= 80 ? 'bg-red-400' : 
                                    percentageFull >= 50 ? 'bg-yellow-400' : 'bg-green-400'
                                  }`}
                                  style={{ width: `${percentageFull}%` }}
                                ></div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Submit Button - Only show if student hasn't submitted yet */}
        {!hasStudentSubmitted() && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-10"
          >
            <motion.button
              whileHover={{ 
                scale: isSelectionComplete() ? 1.05 : 1,
                boxShadow: isSelectionComplete() ? "0 10px 30px -5px rgba(59, 130, 246, 0.5)" : "none"
              }}
              whileTap={{ scale: isSelectionComplete() ? 0.95 : 1 }}
              disabled={!isSelectionComplete()}
              onClick={handleSubmit}
              className={`px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl flex items-center justify-center mx-auto ${
                isSelectionComplete() 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSelectionComplete() ? (
                <>
                  <FiSend className="mr-3" />
                  Submit Selections
                  <FiCheckCircle className="ml-3" />
                </>
              ) : (
                <>
                  <FiInfo className="mr-3" />
                  Complete All Selections
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 bg-green-500/20 border border-green-400/30 text-green-300 px-6 py-4 rounded-2xl inline-flex items-center backdrop-blur-sm"
                >
                  <FiCheckCircle className="mr-3 text-xl" />
                  <span className="font-medium">Selections submitted successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default StudentCbcs;