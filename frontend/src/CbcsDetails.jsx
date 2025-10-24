import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  Clock,
  Calendar,
  Building,
  GraduationCap,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  UserCheck,
  Star,
  Award,
  Target,
  BarChart3,
  Shield,
  Sparkles,
  Download,
  Eye,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  User,
  IdCard,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { FaUniversity, FaChalkboardTeacher, FaRegChartBar } from "react-icons/fa";

// Professional Card Component
const ProfessionalCard = ({ children, className = "", onClick }) => (
  <motion.div
    className={`bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    whileHover={{ scale: onClick ? 1.02 : 1, y: onClick ? -3 : 0 }}
    whileTap={{ scale: onClick ? 0.98 : 1 }}
    transition={{ type: "spring", stiffness: 300 }}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-gray-800 text-2xl font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color = "blue", trend }) => (
  <ProfessionalCard className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}
        >
          <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'transform rotate-180' : ''}`} />
          <span className="text-xs font-bold">{Math.abs(trend)}%</span>
        </motion.div>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
    <div className="text-gray-600 text-sm">{label}</div>
  </ProfessionalCard>
);

// Subject Card Component
const SubjectCard = ({ subject, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <ProfessionalCard className="p-6 hover:border-blue-300 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">{subject.name}</h3>
          <p className="text-blue-600 font-mono text-sm">{subject.subject_id}</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-gray-700 text-sm font-semibold">
            {subject.staffs.reduce((sum, staff) => sum + staff.student_limit, 0)} slots
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {subject.staffs.map((staff, staffIndex) => (
          <motion.div
            key={staff.staff_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (index * 0.1) + (staffIndex * 0.05) }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-gray-800 font-semibold">{staff.staff_name}</div>
                <div className="text-gray-500 text-xs">{staff.staff_id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-gray-800 font-bold text-sm">{staff.student_limit}</div>
                <div className="text-gray-500 text-xs">students</div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </ProfessionalCard>
  </motion.div>
);

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, label, enabledColor = "blue" }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
    <span className="text-gray-700 font-medium">{label}</span>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled 
          ? `bg-${enabledColor}-600` 
          : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// Student Row Component for Pending Students
const StudentRow = ({ student, index }) => (
  <motion.tr
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
  >
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-gray-800 font-semibold">{student.name}</div>
        </div>
      </div>
    </td>
    <td className="py-4 px-4">
      <div className="text-gray-700 font-mono text-sm">{student.regno}</div>
    </td>
    <td className="py-4 px-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-red-600 font-medium">Pending</span>
      </div>
    </td>
  </motion.tr>
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CbcsDetails = () => {
  const { id } = useParams();
  const [cbcsData, setCbcsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [showPendingStudents, setShowPendingStudents] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchCbcsDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/student_cbcs/${id}`);
        
        if (response.data.success) {
          setCbcsData(response.data.data);
        } else {
          throw new Error('Failed to fetch CBCS details');
        }
      } catch (err) {
        console.error('Error fetching CBCS details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCbcsDetails();
  }, [id]);

  // Fetch pending students (JSON for UI)
const fetchPendingStudents = async () => {
  try {
    setLoadingPending(true);
    const response = await axios.get(
      `http://localhost:5000/api/student_cbcs/${id}/pending?format=json`
    );

    if (response.data.success) {
      setPendingStudents(response.data.data);
      setShowPendingStudents(true);
    } else {
      throw new Error('Failed to fetch pending students');
    }
  } catch (err) {
    console.error('Error fetching pending students:', err);
    alert('Error fetching pending students');
  } finally {
    setLoadingPending(false);
  }
};

// Download pending students as Excel
const downloadPendingStudentsExcel = async () => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/student_cbcs/${id}/pending?format=excel`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pending_students_${cbcsData.cbcs_id}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading Excel:', err);
    alert('Error downloading Excel file');
  }
};


  const updateCbcsStatus = async (enabled) => {
    try {
      setUpdatingStatus(true);
      const response = await axios.put(`http://localhost:5000/api/student_cbcs/${id}/updateCbcs`, {
        enabled: enabled
      });
      
      if (response.data.success) {
        setCbcsData(prev => ({
          ...prev,
          cbcs_enabled: enabled
        }));
      } else {
        throw new Error('Failed to update CBCS status');
      }
    } catch (err) {
      console.error('Error updating CBCS status:', err);
      alert('Error updating CBCS status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateFeedbackStatus = async (enabled) => {
    try {
      setUpdatingStatus(true);
      const response = await axios.put(`http://localhost:5000/api/student_cbcs/${id}/updateFeedback`, {
        enabled: enabled
      });
      
      if (response.data.success) {
        setCbcsData(prev => ({
          ...prev,
          feedback_enabled: enabled
        }));
      } else {
        throw new Error('Failed to update feedback status');
      }
    } catch (err) {
      console.error('Error updating feedback status:', err);
      alert('Error updating feedback status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <div>Error: {error}</div>;
  if (!cbcsData) return <div>No data found</div>;

  const completionRate = cbcsData.total_students > 0 
    ? (cbcsData.submissions.length / cbcsData.total_students) * 100 
    : 0;

  const totalStaff = cbcsData.subjects.reduce((total, subject) => total + subject.staffs.length, 0);
  const totalStudentSlots = cbcsData.subjects.reduce(
    (total, subject) => total + subject.staffs.reduce((sum, staff) => sum + staff.student_limit, 0), 
    0
  );

  const pendingStudentsCount = cbcsData.total_students - cbcsData.submissions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FaUniversity className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            CBCS Details
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive overview of the Choice Based Credit System
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Completion Progress */}
            <ProfessionalCard className="p-6 text-center">
              <h3 className="text-gray-800 font-semibold mb-4">Completion Progress</h3>
              <div className="flex justify-center mb-4">
                <ProgressRing progress={completionRate} />
              </div>
              <div className="text-gray-600 text-sm">
                {cbcsData.submissions.length} of {cbcsData.total_students} students completed
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2"
              />
            </ProfessionalCard>

            {/* Quick Stats */}
            <StatsCard 
              icon={Users} 
              label="Total Students" 
              value={cbcsData.total_students} 
              color="blue" 
            />
            <StatsCard 
              icon={UserCheck} 
              label="Completed" 
              value={cbcsData.submissions.length} 
              color="green" 
              trend={completionRate}
            />
            <StatsCard 
              icon={FaChalkboardTeacher} 
              label="Teaching Staff" 
              value={totalStaff} 
              color="blue" 
            />
            <StatsCard 
              icon={Target} 
              label="Available Slots" 
              value={totalStudentSlots} 
              color="blue" 
            />

            {/* 🆕 Admin Controls Section */}
            <ProfessionalCard className="p-6">
              <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Admin Controls
              </h3>
              
              <div className="space-y-4">
                <ToggleSwitch
                  enabled={cbcsData.cbcs_enabled}
                  onChange={() => updateCbcsStatus(!cbcsData.cbcs_enabled)}
                  label="CBCS Filling"
                  enabledColor="green"
                />
                
                <ToggleSwitch
                  enabled={cbcsData.feedback_enabled}
                  onChange={() => updateFeedbackStatus(!cbcsData.feedback_enabled)}
                  label="Feedback System"
                  enabledColor="purple"
                />

                {/* Pending Students Actions */}
                <div className="space-y-2">
                  <motion.button
                    onClick={fetchPendingStudents}
                    disabled={loadingPending}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-4 h-4" />
                    {loadingPending ? 'Loading...' : `View Pending (${pendingStudentsCount})`}
                  </motion.button>

                  <motion.button
                    onClick={downloadPendingStudentsExcel}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Download Excel
                  </motion.button>
                </div>
              </div>
            </ProfessionalCard>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* CBCS Overview Card */}
            <ProfessionalCard className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-gray-800 font-bold text-lg">{cbcsData.cbcs_id}</div>
                  <div className="text-gray-600 text-sm">CBCS ID</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-gray-800 font-bold text-lg">{cbcsData.batch}</div>
                  <div className="text-gray-600 text-sm">Batch</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-gray-800 font-bold text-lg">Semester {cbcsData.semester}</div>
                  <div className="text-gray-600 text-sm">Semester</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-gray-800 font-bold text-lg truncate" title={cbcsData.department}>
                    {cbcsData.department}
                  </div>
                  <div className="text-gray-600 text-sm">Department</div>
                </motion.div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    cbcsData.complete 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  {cbcsData.complete ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold">Complete</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">In Progress</span>
                    </>
                  )}
                </motion.div>

                {/* 🆕 System Status Badges */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.75 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    cbcsData.cbcs_enabled
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  {cbcsData.cbcs_enabled ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      <span className="font-semibold">CBCS Enabled</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      <span className="font-semibold">CBCS Disabled</span>
                    </>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    cbcsData.feedback_enabled
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-semibold">
                    Feedback {cbcsData.feedback_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </motion.div>
              </div>
            </ProfessionalCard>

            {/* 🆕 Pending Students Section */}
            {showPendingStudents && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <ProfessionalCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Pending Students</h2>
                        <p className="text-gray-600">{pendingStudents.length} students haven't completed CBCS</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setShowPendingStudents(false)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <XCircle className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="py-4 px-4 text-left text-gray-700 font-semibold">Student</th>
                          <th className="py-4 px-4 text-left text-gray-700 font-semibold">Student ID</th>
                          <th className="py-4 px-4 text-left text-gray-700 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {pendingStudents.map((student, index) => (
                            <StudentRow key={student.student_id} student={student} index={index} />
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </ProfessionalCard>
              </motion.div>
            )}

            {/* Subjects Section */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Subjects & Staff</h2>
                  <p className="text-gray-600">{cbcsData.subjects.length} subjects available</p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {cbcsData.subjects.map((subject, index) => (
                    <SubjectCard 
                      key={subject.subject_id} 
                      subject={subject} 
                      index={index} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Additional Info */}
            <ProfessionalCard className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-gray-800 font-semibold">Excel File</div>
                  <div className="text-gray-600 text-sm">
                    {cbcsData.student_excel_file ? 'Uploaded' : 'Not Uploaded'}
                  </div>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-gray-800 font-semibold">Submission Rate</div>
                  <div className="text-gray-600 text-sm">{completionRate.toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-gray-800 font-semibold">Status</div>
                  <div className="text-gray-600 text-sm">
                    {cbcsData.complete ? 'Verified' : 'Pending'}
                  </div>
                </div>
              </div>
            </ProfessionalCard>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CbcsDetails;