import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBook, 
  FiMessageSquare, 
  FiUser, 
  FiLogOut, 
  FiHome,
  FiChevronRight,
  FiAward,
  FiBarChart2,
  FiSettings
} from 'react-icons/fi';
import { FaGraduationCap, FaUniversity } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { type, id, regno } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock student data - replace with actual API call
  useEffect(() => {
    // Simulate API call to fetch student data
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call
        setTimeout(() => {
          setStudentData({
            name: regno,
            regno: regno,
            department: "Computer Science",
            semester: "5th",
            email: "john.doe@student.edu",
            avatar: null
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [regno]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/');
  };

  const dashboardCards = [
    {
      id: 'cbcs',
      title: 'CBCS Portal',
      description: 'Access your CBCS courses and academic information',
      icon: <FiBook className="text-2xl" />,
      path: `/student_cbcs/${type}/${id}/${regno}`,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      id: 'staff-feedback',
      title: 'Staff Feedback',
      description: 'View and manage staff feedback options',
      icon: <FiUser className="text-2xl" />,
      path: '/staff-stu',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      id: 'feedback',
      title: 'Submit Feedback',
      description: 'Fill out feedback forms for courses and staff',
      icon: <FiMessageSquare className="text-2xl" />,
      path: `/feedback/${id}/${regno}/${type}`,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FaUniversity className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold text-gray-800">Student Portal</span>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{studentData?.name}</p>
                <p className="text-sm text-gray-500">{studentData?.regno}</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold"
              >
                {studentData?.name?.charAt(0) || 'S'}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {studentData?.name}!
          </h1>
          <p className="text-gray-600">
            {studentData?.department} • {studentData?.semester} Semester
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Semester</p>
                <p className="text-2xl font-bold text-gray-900">5th</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Feedback</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FiMessageSquare className="text-green-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CGPA</p>
                <p className="text-2xl font-bold text-gray-900">8.75</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <FiAward className="text-purple-600 text-xl" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Dashboard Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className={`${card.bgColor} rounded-2xl shadow-lg overflow-hidden cursor-pointer border border-transparent hover:border-gray-200`}
              onClick={() => handleNavigation(card.path)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center text-white`}>
                    {card.icon}
                  </div>
                  <FiChevronRight className={`text-xl ${card.textColor}`} />
                </div>
                <h3 className={`text-xl font-bold ${card.textColor} mb-2`}>
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {card.description}
                </p>
              </div>
              <div className={`h-1 bg-gradient-to-r ${card.color}`} />
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <FiSettings className="text-gray-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FiBarChart2 />, label: 'Results', color: 'text-orange-500' },
              { icon: <FiBook />, label: 'Timetable', color: 'text-green-500' },
              { icon: <FiUser />, label: 'Profile', color: 'text-blue-500' },
              { icon: <FiMessageSquare />, label: 'Messages', color: 'text-purple-500' }
            ].map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`text-2xl ${action.color} mb-2`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <FiLogOut className="mr-2" />
            Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;