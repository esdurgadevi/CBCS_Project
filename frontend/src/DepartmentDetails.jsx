import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiBook, 
  FiGitBranch, 
  FiList,
  FiAward,
  FiSettings,
  FiArrowLeft,
  FiPlus,
  FiUser,
  FiBookOpen,
  FiLayers,
  FiStar
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';

const DepartmentDetails = () => {
  const [department, setDepartment] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    staffCount: 0,
    domainCount: 0,
    coreSubjectCount: 0,
    cbcsCount: 0
  });

  const { dept_id } = useParams();
  const navigate = useNavigate();

  // Fetch department details
  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://cbcs-project.onrender.com/api/departments/${dept_id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch department details');
        }
        
        const data = await response.json();
        setDepartment(data);

        // Fetch additional statistics (you might want to create specific APIs for these)
        // For now, we'll use mock data - replace with actual API calls
        const staffResponse = await fetch(`https://cbcs-project.onrender.com/api/staffs/department/${dept_id}`);
        const staffData = await staffResponse.json();
        
        const domainsResponse = await fetch(`https://cbcs-project.onrender.com/api/domains/dept/${dept_id}`);
        const domainsData = await domainsResponse.json();

        setStats({
          staffCount: staffData.length || 0,
          domainCount: domainsData.length || 0,
          coreSubjectCount: 12, // Mock data - replace with actual API
          cbcsCount: 8 // Mock data - replace with actual API
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (dept_id) {
      fetchDepartmentDetails();
    }
  }, [dept_id]);

  // Tab configurations
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiUsers },
    { id: 'staffs', label: 'Staff Members', icon: FiUsers },
    { id: 'domains', label: 'Domains', icon: FiGitBranch },
    { id: 'coresubjects', label: 'Core Subjects', icon: FiBook },
    { id: 'cbcslist', label: 'CBCS List', icon: FiList },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  // Navigation handlers
  const handleViewStaff = () => {
    navigate('/staff-stu', {
      state: {
        department: department
      }
    });
  };

  const handleViewDomains = () => {
    navigate('/domainlist', {
      state: {
        department: department
      }
    });
  };
  const handleViewCBCS = () => {
    navigate('/cbcslist', {
      state: {
        department: department
      }
    });
  };

  const handleAddStaff = () => {
    navigate('/staff-create', {
      state: {
        department: department
      }
    });
  };

  const handleAddDomain = () => {
    navigate('/domain-create', {
      state: {
        department: department
      }
    });
  };
  const handleViewcore = () => {
    navigate('/core-sub', {
      state: {
        department: department
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading department details...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAward className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Department Not Found</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (!department) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white pb-32 pt-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <button
              onClick={handleBack}
              className="flex items-center text-white/80 hover:text-white transition-colors p-3 rounded-2xl hover:bg-white/10"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </button>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-colors backdrop-blur-sm"
              >
                <FiSettings size={18} />
                Manage
              </motion.button>
            </div>
          </motion.div>

          {/* Department Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <FiAward className="text-white text-4xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{department.dept_name}</h1>
            <p className="text-xl text-blue-100 opacity-90">Department ID: {department.dept_id}</p>
            <p className="text-blue-100 opacity-75 mt-2 max-w-2xl mx-auto">
              Leading excellence in education and research with dedicated professionals and innovative programs.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-24">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Staff Count */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiUsers className="text-blue-600 text-xl" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.staffCount}</div>
            <div className="text-gray-600">Staff Members</div>
          </div>

          {/* Domains Count */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiGitBranch className="text-purple-600 text-xl" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.domainCount}</div>
            <div className="text-gray-600">Domains</div>
          </div>

          {/* Core Subjects Count */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiBook className="text-green-600 text-xl" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.coreSubjectCount}</div>
            <div className="text-gray-600">Core Subjects</div>
          </div>

          {/* CBCS Count */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiList className="text-orange-600 text-xl" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.cbcsCount}</div>
            <div className="text-gray-600">CBCS Courses</div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl p-2 mb-8"
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 rounded-2xl font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3" size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Department Overview</h2>
                  <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                    Welcome to the {department.dept_name} department. We are committed to excellence 
                    in education, research, and innovation. Our department brings together talented 
                    professionals and students to create a dynamic learning environment.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleViewStaff}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-2xl text-left transition-all duration-300"
                  >
                    <FiUsers className="text-3xl mb-4" />
                    <h3 className="text-xl font-bold mb-2">View All Staff</h3>
                    <p className="text-blue-100">Browse through all {stats.staffCount} staff members in this department</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleViewDomains}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-2xl text-left transition-all duration-300"
                  >
                    <FiGitBranch className="text-3xl mb-4" />
                    <h3 className="text-xl font-bold mb-2">Explore Domains</h3>
                    <p className="text-purple-100">Discover {stats.domainCount} specialized domains and research areas</p>
                  </motion.button>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <FiUser className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">New Staff Member Added</p>
                          <p className="text-sm text-gray-600">2 days ago</p>
                        </div>
                      </div>
                      <FiStar className="text-yellow-400" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FiBookOpen className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Core Subjects Updated</p>
                          <p className="text-sm text-gray-600">1 week ago</p>
                        </div>
                      </div>
                      <FiStar className="text-yellow-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'staffs' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Staff Members</h2>
                    <p className="text-gray-600">
                      Manage and view all staff members in the {department.dept_name} department
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddStaff}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FiPlus size={18} />
                    Add Staff
                  </motion.button>
                </div>

                <div className="text-center py-12">
                  <FiUsers className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Staff Management</h3>
                  <p className="text-gray-500 mb-6">View and manage all department staff members</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleViewStaff}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-colors"
                  >
                    View All Staff Members
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'domains' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Domains</h2>
                    <p className="text-gray-600">
                      Specialized domains and research areas within {department.dept_name}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddDomain}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FiPlus size={18} />
                    Add Domain
                  </motion.button>
                </div>

                <div className="text-center py-12">
                  <FiGitBranch className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Domain Management</h3>
                  <p className="text-gray-500 mb-6">Explore and manage specialized domains</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleViewDomains}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-colors"
                  >
                    View All Domains
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'coresubjects' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">CoreSubjects</h2>
                    <p className="text-gray-600">
                      Specialized coresubjects in the department {department.dept_name}
                    </p>
                  </div>
                </div>

                <div className="text-center py-12">
                  <FiGitBranch className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">CoreSubject Management</h3>
                  <p className="text-gray-500 mb-6">Explore and manage specialized subjects</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleViewcore}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-colors"
                  >
                    View All Coresubjects
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'cbcslist' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">CBCS List</h2>
                    <p className="text-gray-600">
                      Created CBCS List for {department.dept_name}
                    </p>
                  </div>
                </div>

                <div className="text-center py-12">
                  <FiGitBranch className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">CBCS Management</h3>
                  <p className="text-gray-500 mb-6">Explore and manage specialized domains</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleViewCBCS}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-colors"
                  >
                    View All CBCS
                  </motion.button>
                </div>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Department Settings</h2>
                <p className="text-gray-600">
                  Manage department settings and configurations
                </p>
                <div className="text-center py-12">
                  <FiSettings className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Settings</h3>
                  <p className="text-gray-500">Department settings management coming soon...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default DepartmentDetails;