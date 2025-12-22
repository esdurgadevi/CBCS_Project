import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, User, BookOpen, Send, Loader, ChevronDown, ChevronUp } from 'lucide-react';

const StudentFeedback = ({ studentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [selectedStaffs, setSelectedStaffs] = useState({});
  const [ratings, setRatings] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://cbcs-project.onrender.com/api/student_cbcs/${studentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        setData(result.data);
        
        // Initialize expanded state for all subjects
        const initialExpanded = {};
        result.data.subjects?.forEach(subject => {
          initialExpanded[subject.subject_id] = false;
        });
        setExpandedSubjects(initialExpanded);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Toggle subject expansion
  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Handle staff selection
  const handleStaffSelect = (subjectId, staffId) => {
    setSelectedStaffs(prev => ({
      ...prev,
      [subjectId]: staffId
    }));
  };

  // Handle star rating
  const handleRating = (subjectId, staffId, rating) => {
    setRatings(prev => ({
      ...prev,
      [`${subjectId}-${staffId}`]: rating
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Prepare feedback data
    const feedbackData = [];
    
    data?.subjects?.forEach(subject => {
      const staffId = selectedStaffs[subject.subject_id];
      if (staffId && ratings[`${subject.subject_id}-${staffId}`]) {
        feedbackData.push({
          subject_id: subject.subject_id,
          subject_name: subject.name,
          staff_id: staffId,
          staff_name: subject.staffs.find(s => s.staff_id === staffId)?.staff_name,
          rating: ratings[`${subject.subject_id}-${staffId}`]
        });
      }
    });

    if (feedbackData.length === 0) {
      alert('Please provide at least one rating before submitting');
      setSubmitting(false);
      return;
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Feedback submitted:', feedbackData);
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedStaffs({});
    setRatings({});
    setExpandedSubjects({});
    setSubmitted(false);
  };

  // Check if subject has feedback
  const hasFeedback = (subjectId) => {
    const staffId = selectedStaffs[subjectId];
    return staffId && ratings[`${subjectId}-${staffId}`];
  };

  // Get total feedback count
  const totalFeedback = data?.subjects?.filter(subject => hasFeedback(subject.subject_id)).length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4"
        >
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading your subjects...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Send className="w-8 h-8 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback Submitted!</h2>
          <p className="text-gray-600 mb-6">Thank you for your valuable feedback.</p>
          <button
            onClick={handleReset}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Submit More Feedback
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Feedback</h1>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Department:</span>
                <span className="text-gray-700">{data?.department}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Batch:</span>
                <span className="text-gray-700">{data?.batch}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="font-semibold">Semester:</span>
                <span className="text-gray-700">{data?.semester}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Feedback Progress</h3>
            <span className="text-sm font-medium text-blue-600">
              {totalFeedback} of {data?.subjects?.length} subjects rated
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalFeedback / data?.subjects?.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-green-500 h-2 rounded-full transition-all"
            />
          </div>
        </motion.div>

        {/* Subjects List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {data?.subjects?.map((subject, index) => (
            <motion.div
              key={subject.subject_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Subject Header */}
              <button
                onClick={() => toggleSubject(subject.subject_id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    hasFeedback(subject.subject_id) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-600">{subject.subject_id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {hasFeedback(subject.subject_id) && (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      Rated
                    </span>
                  )}
                  {expandedSubjects[subject.subject_id] ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Staff Selection and Rating */}
              <AnimatePresence>
                {expandedSubjects[subject.subject_id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 p-6"
                  >
                    {/* Staff Dropdown */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Staff for {subject.name}
                      </label>
                      <select
                        value={selectedStaffs[subject.subject_id] || ''}
                        onChange={(e) => handleStaffSelect(subject.subject_id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Choose a staff member...</option>
                        {subject.staffs?.map((staff) => (
                          <option key={staff.staff_id} value={staff.staff_id}>
                            {staff.staff_name} ({staff.staff_id})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rating Section */}
                    <AnimatePresence>
                      {selectedStaffs[subject.subject_id] && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                        >
                          <div className="text-center mb-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-2">
                              Rate {subject.staffs.find(s => s.staff_id === selectedStaffs[subject.subject_id])?.staff_name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              for {subject.name}
                            </p>
                          </div>

                          {/* Star Rating */}
                          <div className="flex justify-center space-x-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <motion.button
                                key={star}
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRating(subject.subject_id, selectedStaffs[subject.subject_id], star)}
                                className={`p-2 rounded-full transition-colors ${
                                  ratings[`${subject.subject_id}-${selectedStaffs[subject.subject_id]}`] >= star
                                    ? 'text-yellow-400 bg-yellow-50'
                                    : 'text-gray-300 hover:text-yellow-400'
                                }`}
                              >
                                <Star
                                  className="w-8 h-8"
                                  fill={ratings[`${subject.subject_id}-${selectedStaffs[subject.subject_id]}`] >= star ? 'currentColor' : 'none'}
                                />
                              </motion.button>
                            ))}
                          </div>

                          {/* Rating Labels */}
                          <div className="text-center">
                            <p className="text-sm text-gray-600">
                              {ratings[`${subject.subject_id}-${selectedStaffs[subject.subject_id]}`] ? (
                                <span className="font-semibold text-blue-600">
                                  {ratings[`${subject.subject_id}-${selectedStaffs[subject.subject_id]}`]} star{ratings[`${subject.subject_id}-${selectedStaffs[subject.subject_id]}`] > 1 ? 's' : ''} selected
                                </span>
                              ) : (
                                'Click stars to rate'
                              )}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <motion.button
            onClick={handleSubmit}
            disabled={submitting || totalFeedback === 0}
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Submitting Feedback...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit All Feedback ({totalFeedback} rated)</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          <p>Expand each subject to select staff and provide ratings. Your feedback is anonymous.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentFeedback;