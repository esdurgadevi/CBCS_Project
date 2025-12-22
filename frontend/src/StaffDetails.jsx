import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  User, 
  Mail, 
  Phone, 
  BarChart3,
  TrendingUp,
  Users,
  Trash2,
  Edit
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const StaffDetails = () => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { staffId } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState('');
  const [domain, setDomain] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://cbcs-project.onrender.com/api/staffs/${staffId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch staff details');
        }
        
        const data = await response.json();
        // Enhanced staff data with larger image
        const enhancedData = {
          ...data,
          image: data.image || `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&crop=face&auto=format&q=80`,
          // Calculate overall satisfaction from feedback if available
          vidwanScore: data.feedback ? (data.feedback.overall_satisfaction / 5) * 10 : 0
        };
        
        setStaff(enhancedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (staffId) {
      fetchStaff();
    }
  }, [staffId]);

  useEffect(() => {
    const fetchdept = async () => {
      try {
        if (staff) {
          const res1 = await fetch(`https://cbcs-project.onrender.com/api/departments/${staff.dept_id}`);
          const res2 = await fetch(`https://cbcs-project.onrender.com/api/domains/${staff.domain_id}`);
          const d1 = await res1.json();
          const d2 = await res2.json();
          setDept(d1.dept_name);
          setDomain(d2.name);
        }
      } catch (err) {
        console.log(err);
      }
    }
    if (staff) fetchdept();
  }, [staff]);

  // Delete staff function
  const handleDeleteStaff = async () => {
    try {
      setDeleteLoading(true);
      const response = await fetch(`https://cbcs-project.onrender.com/api/staffs/${staffId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete staff member');
      }

      // Show success message or redirect
      navigate('/admin-dashboard'); // Redirect to staff list page after deletion
      
    } catch (err) {
      setError(err.message);
      setDeleteLoading(false);
    }
  };

  // Function to render star ratings
  const renderStarRating = (rating, maxRating = 5) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(maxRating)].map((_, index) => (
          <Star
            key={index}
            size={20}
            className={index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="ml-2 text-lg font-medium text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const handleEdit = () => {
    // Navigate to CreateStaff component with staff data as state
    navigate('/staff-create', { 
      state: { 
        editMode: true, 
        staffData: staff 
      } 
    });
  };

  // Function to render progress bars for feedback metrics
  const renderFeedbackMetric = (label, value, maxValue = 5) => {
    const percentage = (value / maxValue) * 100;
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-base font-medium text-gray-700 capitalize">
            {label.replace(/_/g, ' ')}
          </span>
          <span className="text-lg font-semibold text-blue-600">{value.toFixed(1)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
          />
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Staff Member</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {staff?.name}? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteStaff}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error && !showDeleteModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Staff Details</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Staff Not Found</h2>
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter out non-feedback fields from the feedback object
  const feedbackMetrics = staff.feedback ? Object.entries(staff.feedback).filter(([key]) => 
    !['_id', 'count'].includes(key)
  ) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {showDeleteModal && <DeleteConfirmationModal />}
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section with Large Image */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Large Profile Image Section */}
            <div className="lg:w-2/5 relative">
              {staff.image && !imageError ? (
                <motion.div
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className="h-64 lg:h-full"
                >
                  <img
                    src={`https://cbcs-project.onrender.com/${staff.image}`}
                    alt={staff.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </motion.div>
              ) : (
                <div className="h-64 lg:h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User size={80} className="text-white" />
                </div>
              )}
              
              {/* Staff ID Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Staff ID: {staff.staff_id}</span>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                Active
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="lg:w-3/5 p-8">
              <div className="flex flex-col h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">{staff.name}</h1>
                      <p className="text-xl text-blue-600 font-semibold mb-4">Assistant Professor</p>
                      <p className="text-lg text-gray-600 mb-6">National Engineering College, Kovilpatti</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleEdit}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Edit Staff"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Delete Staff"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                      <Mail size={20} className="mr-2 text-blue-500" />
                      <span className="font-medium">{staff.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                      <Phone size={20} className="mr-2 text-green-500" />
                      <span className="font-medium">{staff.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Vidwan Score Section */}
                <div className="mt-auto">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Vidwan Score</h3>
                        <div className="text-5xl font-bold">{staff.vidwanScore.toFixed(1)}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex justify-end mb-2">
                          {renderStarRating(staff.feedback?.overall_satisfaction || 0)}
                        </div>
                        <p className="text-blue-100">Overall Performance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feedback Metrics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center mb-6">
                <BarChart3 className="text-blue-500 mr-3" size={28} />
                <h2 className="text-3xl font-bold text-gray-900">Teaching Feedback Metrics</h2>
              </div>
              
              <div className="space-y-4">
                {feedbackMetrics.map(([metric, value]) => (
                  <div key={metric}>
                    {renderFeedbackMetric(metric, value)}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Department Info */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center mb-4">
                <Users className="text-green-500 mr-3" size={24} />
                <h3 className="text-xl font-semibold text-gray-900">Department Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Department :</span>
                  <span className="font-medium text-gray-900">{dept}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Domain :</span>
                  <span className="font-medium text-gray-900">{domain}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Domain ID :</span>
                  <span className="font-medium text-gray-900">{staff.domain_id}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Department ID :</span>
                  <span className="font-medium text-gray-900">{staff.dept_id}</span>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="mr-3" size={24} />
                <h3 className="text-xl font-semibold">Performance Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Teaching Quality</span>
                  <span className="font-bold text-lg">
                    {staff.feedback ? ((staff.feedback.overall_satisfaction / 5) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Student Engagement</span>
                  <span className="font-bold text-lg">
                    {staff.feedback ? ((staff.feedback.interaction / 5) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Content Delivery</span>
                  <span className="font-bold text-lg">
                    {staff.feedback ? ((staff.feedback.content_delivery / 5) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Feedback Count</span>
                  <span className="font-bold text-lg">
                    {staff.feedback?.count || 0}
                  </span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;