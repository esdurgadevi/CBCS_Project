import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiBook, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiArrowLeft,
  FiAward,
  FiGitBranch,
  FiStar,
  FiChevronRight,
  FiUserPlus
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';

const DomainDetails = () => {
  const [domain, setDomain] = useState(null);
  const [department, setDepartment] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { domain_id } = useParams();
  const navigate = useNavigate();

  // Fetch domain details
  useEffect(() => {
    const fetchDomainDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://cbcs-project.onrender.com/api/domains/${domain_id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch domain details');
        }
        
        const domainData = await response.json();
        setDomain(domainData);

        // Fetch department details
        if (domainData.dept_id) {
          const deptResponse = await fetch(`https://cbcs-project.onrender.com/api/departments/${domainData.dept_id}`);
          if (deptResponse.ok) {
            const deptData = await deptResponse.json();
            setDepartment(deptData);
          }
        }

        // Fetch staff details
        if (domainData.staffs && domainData.staffs.length > 0) {
          const staffPromises = domainData.staffs.map(staffId => 
            fetch(`https://cbcs-project.onrender.com/api/staffs/${staffId}`).then(res => res.json())
          );
          const staffsData = await Promise.all(staffPromises);
          setStaffs(staffsData.filter(staff => staff && !staff.error));
        }

        // Fetch subject details if available
        // if (domainData.subjects && domainData.subjects.length > 0) {
        //   const subjectPromises = domainData.subjects.map(subjectId =>
        //     fetch(`http://localhost:5000/api/subjects/${subjectId}`).then(res => res.json())
        //   );
        //   const subjectsData = await Promise.all(subjectPromises);
        //   setSubjects(subjectsData.filter(subject => subject && !subject.error));
        // }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (domain_id) {
      fetchDomainDetails();
    }
  }, [domain_id]);

  // Handle delete domain
  const handleDeleteDomain = async () => {
    try {
      setDeleteLoading(true);
      const response = await fetch(`https://cbcs-project.onrender.com/api/domains/${domain._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete domain');
      }

      navigate('/domains'); // Redirect to domains list page
      
    } catch (err) {
      setError(err.message);
      setDeleteLoading(false);
    }
  };

  // Handle edit domain
  const handleEditDomain = () => {
    // Navigate to edit domain page or open modal
    // For now, we'll log it
    console.log('Edit domain:', domain);
    // You can implement edit functionality here
  };

  // Handle add staff
 const handleAddStaff = () => {
  navigate('/staff-create', {
    state: {
      department: {
        dept_id: domain.dept_id,
        dept_name: department?.dept_name || "Selected Department" // Make sure you have department data
      },
      domain: {
        domain_id: domain.domain_id,
        name: domain.name
      }
    }
  });
};

  // Handle view staff details
  const handleViewStaff = (staffId) => {
    navigate(`/staffdetails/${staffId}`);
  };

  // Handle back navigation
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
          <p className="text-gray-600 text-lg">Loading domain details...</p>
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
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Domain Not Found</h3>
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

  if (!domain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FiAward className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Domain Not Found</h2>
        </div>
      </div>
    );
  }

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrash2 className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Domain</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>{domain.name}</strong>? This action cannot be undone and will remove all associated data.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-colors"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteDomain}
              className="px-6 py-3 text-white bg-red-500 hover:bg-red-600 rounded-2xl font-semibold flex items-center gap-2 transition-colors"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 size={16} />
                  Delete Domain
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {showDeleteModal && <DeleteConfirmationModal />}
      
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors p-3 rounded-2xl hover:bg-white/50"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditDomain}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-colors shadow-lg"
            >
              <FiEdit2 size={18} />
              Edit Domain
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-colors shadow-lg"
            >
              <FiTrash2 size={18} />
              Delete Domain
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Domain Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Domain Header Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <FiGitBranch className="text-white text-2xl" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-gray-800">{domain.name}</h1>
                      <p className="text-gray-600 text-lg">Domain ID: {domain.domain_id}</p>
                    </div>
                  </div>
                  
                  {department && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiGitBranch className="text-blue-500" />
                      <span>Department: <strong>{department.dept_name}</strong></span>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Active Domain
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Staff Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FiUsers className="text-blue-500" />
                  Associated Staff
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                    {staffs.length}
                  </span>
                </h2>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddStaff}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-colors shadow-lg"
                >
                  <FiUserPlus size={18} />
                  Add Staff
                </motion.button>
              </div>

              {staffs.length === 0 ? (
                <div className="text-center py-12">
                  <FiUsers className="text-gray-300 text-4xl mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Staff Members</h3>
                  <p className="text-gray-500 mb-6">No staff members are currently associated with this domain.</p>
                  <button
                    onClick={handleAddStaff}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
                  >
                    Add First Staff Member
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staffs.map((staff, index) => (
                    <motion.div
                      key={staff.staff_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => handleViewStaff(staff.staff_id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <FiUsers className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{staff.name}</h4>
                          <p className="text-sm text-gray-600">{staff.staff_id}</p>
                        </div>
                        <FiChevronRight className="text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Subjects Section */}
            {subjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                  <FiBook className="text-green-500" />
                  Related Subjects
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                    {subjects.length}
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={subject._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4"
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">{subject.name}</h4>
                      <p className="text-sm text-gray-600">Code: {subject.code}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Statistics & Actions */}
          <div className="space-y-8">
            {/* Statistics Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-6">Domain Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Staff Members</span>
                  <span className="font-bold text-lg">{staffs.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Subjects</span>
                  <span className="font-bold text-lg">{subjects.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <span className="bg-green-400 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddStaff}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <FiUserPlus />
                  Add New Staff
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEditDomain}
                  className="w-full border border-blue-500 text-blue-500 hover:bg-blue-50 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <FiEdit2 />
                  Edit Domain Info
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/staff-stu`, { 
                    state: { domain: domain } 
                  })}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <FiUsers />
                  View All Staff
                </motion.button>
              </div>
            </motion.div>

            {/* Domain Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Domain Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Domain ID</label>
                  <p className="font-semibold text-gray-800">{domain.domain_id}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Domain Name</label>
                  <p className="font-semibold text-gray-800">{domain.name}</p>
                </div>
                
                {department && (
                  <div>
                    <label className="text-sm text-gray-500">Department</label>
                    <p className="font-semibold text-gray-800">{department.dept_name}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm text-gray-500">Created</label>
                  <p className="font-semibold text-gray-800">Recently</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainDetails;