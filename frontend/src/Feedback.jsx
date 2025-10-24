import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Loader2, CheckCircle, BookOpen, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useParams } from 'react-router-dom';

const Feedback = () => {
  const { id, regno,type } = useParams(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      let apiUrl;
      if (type === 'elective') {
        apiUrl = `http://localhost:5000/api/elective-cbcs/${id}`;
      } else {
        apiUrl = `http://localhost:5000/api/student_cbcs/${id}`;
      }
      setLoading(true);
      const response = await fetch(apiUrl);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        if (result.data.feedback_submissions.includes(regno)) {
          setSubmitted(true);
        }
        // Initialize all subjects as collapsed
        const initialExpandedState = {};
        result.data.subjects.forEach(subject => {
          initialExpandedState[subject.subject_id] = false;
        });
        setExpandedSubjects(initialExpandedState);
      } else {
        setError('Failed to load feedback data');
      }
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const handleStaffChange = (subjectId, staffId) => {
    setFeedbacks(prev => ({
      ...prev,
      [subjectId]: {
        subject_id: subjectId,
        staff_id: staffId,
        feedback: {
          content_delivery: 0,
          practical_explanation: 0,
          interaction: 0,
          overall_satisfaction: 0,
          pace: 0,
          structure_organization: 0,
          teaching_methodology: 0
        }
      }
    }));
    // Auto-expand when staff is selected
    if (!expandedSubjects[subjectId]) {
      toggleSubject(subjectId);
    }
  };

  const handleRatingChange = (subjectId, field, rating) => {
    setFeedbacks(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        feedback: {
          ...prev[subjectId].feedback,
          [field]: rating
        }
      }
    }));
  };

  const isFeedbackComplete = () => {
    if (!data) return false;
    
    return data.subjects.every(subject => {
      const feedback = feedbacks[subject.subject_id];
      return feedback && 
             feedback.staff_id && 
             Object.values(feedback.feedback).every(rating => rating > 0);
    });
  };

  const getCompletionPercentage = () => {
    if (!data) return 0;
    const totalSubjects = data.subjects.length;
    if (totalSubjects === 0) return 0;
    
    const completedSubjects = data.subjects.filter(subject => {
      const feedback = feedbacks[subject.subject_id];
      return feedback && 
             feedback.staff_id && 
             Object.values(feedback.feedback).every(rating => rating > 0);
    }).length;
    
    return Math.round((completedSubjects / totalSubjects) * 100);
  };

  const handleSubmit = async () => {
    if (!isFeedbackComplete()) {
      setError('Please complete all feedbacks before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submissionData = {
        regno,
        feedbacks: Object.values(feedbacks)
      };
      let apiUrl1;
      if (type === 'elective') {
        apiUrl1 = `http://localhost:5000/api/elective-cbcs/${id}/${regno}/submit-feedback`;
      } else {
        apiUrl1 = `http://localhost:5000/api/student_cbcs/${id}/${regno}/submit-feedback`;
      }
      const response = await fetch(
        apiUrl1,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        setError('Failed to submit feedback');
      }
    } catch (err) {
      setError('Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label, description }) => {
    const descriptions = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              {label}
            </label>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onChange(star)}
                  className="focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= value
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {value > 0 && (
              <span className="text-xs text-gray-500 mt-1 font-medium">
                {descriptions[value - 1]}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-sm"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading feedback form...</p>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto"
        >
          <div className="relative inline-block mb-4">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute inset-0 bg-green-500/20 rounded-full blur-md"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Thank You!
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Your feedback has been submitted successfully.
          </p>
          <p className="text-gray-500 text-sm">
            Your input helps us improve the learning experience.
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No data available</p>
        </div>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Course Feedback
            </h1>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{data.department}</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium">Batch: {data.batch}</span>
              </div>
              <div className="bg-purple-50 px-4 py-2 rounded-full">
                <span className="font-medium text-purple-700">Semester: {data.semester}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Completion Progress
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full shadow-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subjects */}
        <div className="space-y-6">
          {data.subjects.map((subject, index) => (
            <motion.div
              key={subject.subject_id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Subject Header */}
              <div 
                className="p-6 cursor-pointer bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50"
                onClick={() => toggleSubject(subject.subject_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {subject.name}
                    </h3>
                    <p className="text-gray-600 text-sm font-mono">
                      {subject.subject_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {feedbacks[subject.subject_id]?.staff_id && (
                      <div className="hidden sm:block">
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                          Ready to submit
                        </div>
                      </div>
                    )}
                    <motion.div
                      animate={{ rotate: expandedSubjects[subject.subject_id] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              <AnimatePresence>
                {expandedSubjects[subject.subject_id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      {/* Staff Selection */}
                      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Select Faculty Member
                        </label>
                        <select
                          value={feedbacks[subject.subject_id]?.staff_id || ''}
                          onChange={(e) => handleStaffChange(subject.subject_id, e.target.value)}
                          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                        >
                          <option value="">Choose a faculty member...</option>
                          {subject.staffs.map((staff) => (
                            <option key={staff.staff_id} value={staff.staff_id}>
                              {staff.staff_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Feedback Ratings */}
                      {feedbacks[subject.subject_id]?.staff_id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                        >
                          <StarRating
                            label="Content Delivery"
                            description="Clarity and effectiveness of content presentation"
                            value={feedbacks[subject.subject_id].feedback.content_delivery}
                            onChange={(rating) =>
                              handleRatingChange(
                                subject.subject_id,
                                'content_delivery',
                                rating
                              )
                            }
                          />
                          
                          <StarRating
                            label="Practical Explanation"
                            description="Quality of practical examples and demonstrations"
                            value={feedbacks[subject.subject_id].feedback.practical_explanation}
                            onChange={(rating) =>
                              handleRatingChange(
                                subject.subject_id,
                                'practical_explanation',
                                rating
                              )
                            }
                          />
                          
                          <StarRating
                            label="Teaching Methodology"
                            description="Effectiveness of teaching approaches and techniques"
                            value={feedbacks[subject.subject_id].feedback.teaching_methodology}
                            onChange={(rating) =>
                              handleRatingChange(
                                subject.subject_id,
                                'teaching_methodology',
                                rating
                              )
                            }
                          />
                          
                          <StarRating
                            label="Structure & Organization"
                            description="Logical flow and organization of course material"
                            value={feedbacks[subject.subject_id].feedback.structure_organization}
                            onChange={(rating) =>
                              handleRatingChange(
                                subject.subject_id,
                                'structure_organization',
                                rating
                              )
                            }
                          />
                          
                          <StarRating
                            label="Pace of Teaching"
                            description="Appropriate speed and timing of instruction"
                            value={feedbacks[subject.subject_id].feedback.pace}
                            onChange={(rating) =>
                              handleRatingChange(
                                subject.subject_id,
                                'pace',
                                rating
                              )
                            }
                          />
                          
                          <StarRating
                            label="Interaction & Engagement"
                            description="Level of student-teacher interaction"
                            value={feedbacks[subject.subject_id].feedback.interaction}
                            onChange={(rating) =>
                              handleRatingChange(
                                subject.subject_id,
                                'interaction',
                                rating
                              )
                            }
                          />
                          
                          <div className="lg:col-span-2">
                            <StarRating
                              label="Overall Satisfaction"
                              description="Your overall satisfaction with this course"
                              value={feedbacks[subject.subject_id].feedback.overall_satisfaction}
                              onChange={(rating) =>
                                handleRatingChange(
                                  subject.subject_id,
                                  'overall_satisfaction',
                                  rating
                                )
                              }
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Submit Section */}
        {data.subjects.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200/50">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Submit Your Feedback
                </h3>
                <p className="text-gray-600 mb-6">
                  {isFeedbackComplete() 
                    ? "Thank you for providing comprehensive feedback for all subjects. Your responses will help improve the educational experience."
                    : "Please complete all subject feedbacks before submitting. Your detailed input is valuable for continuous improvement."
                  }
                </p>
                
                <button
                  onClick={handleSubmit}
                  disabled={!isFeedbackComplete() || submitting}
                  className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 mx-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Your Feedback...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit All Feedback
                    </>
                  )}
                </button>
                
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 mt-4 bg-red-50 py-3 px-4 rounded-xl border border-red-200"
                  >
                    {error}
                  </motion.p>
                )}

                {!isFeedbackComplete() && Object.keys(feedbacks).length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-amber-600 mt-4 bg-amber-50 py-3 px-4 rounded-xl border border-amber-200"
                  >
                    ⚠️ Please complete all feedback ratings before submitting
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Feedback;