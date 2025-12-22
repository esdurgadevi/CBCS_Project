import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBook, FiPlus, FiEdit, FiTrash2, FiSearch, 
  FiFilter, FiChevronDown, FiX, FiCheck,
  FiArrowLeft, FiArrowRight, FiAward, FiClock, FiLayers
} from 'react-icons/fi';
import { 
  FaGraduationCap, FaChalkboardTeacher, 
  FaRegClock, FaBook, FaUniversity
} from 'react-icons/fa';

const CoreSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department_id: '',
    semester_no: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [departments] = useState([
    { id: 'cse', name: 'Computer Science', color: 'bg-blue-100 text-blue-800' },
    { id: 'ece', name: 'Electronics & Communication', color: 'bg-purple-100 text-purple-800' },
    { id: 'mech', name: 'Mechanical Engineering', color: 'bg-red-100 text-red-800' },
    { id: 'civil', name: 'Civil Engineering', color: 'bg-green-100 text-green-800' },
    { id: 'eee', name: 'Electrical Engineering', color: 'bg-yellow-100 text-yellow-800' },
  ]);
  const [semesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [formData, setFormData] = useState({
    subject_id: '',
    name: '',
    department_id: '',
    semester_no: '',
    credit: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    totalSubjects: 0,
    byDepartment: {},
    bySemester: {}
  });

  // Color palette
  const colors = {
    primary: '#3A6D8C',    // Blue
    background: '#F2F2F2', // Light background
    accent1: '#A0C49D',    // Green
    accent2: '#FFD60A',    // Yellow
    text: '#2D3748',       // Dark gray for text
    lightText: '#718096',  // Light gray for text
  };

  // Fetch all core subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Update stats when subjects change
  useEffect(() => {
    if (subjects.length > 0) {
      const byDepartment = {};
      const bySemester = {};
      
      subjects.forEach(subject => {
        // Count by department
        if (!byDepartment[subject.department_id]) {
          byDepartment[subject.department_id] = 0;
        }
        byDepartment[subject.department_id]++;
        
        // Count by semester
        if (!bySemester[subject.semester_no]) {
          bySemester[subject.semester_no] = 0;
        }
        bySemester[subject.semester_no]++;
      });
      
      setStats({
        totalSubjects: subjects.length,
        byDepartment,
        bySemester
      });
    }
  }, [subjects]);
  // Apply filters and search
  useEffect(() => {
    let result = subjects;
    if (searchTerm) {
      result = result.filter(subject => 
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.subject_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.department_id) {
      result = result.filter(subject => 
        subject.department_id === filters.department_id
      );
    }
    
    if (filters.semester_no) {
      result = result.filter(subject => 
        subject.semester_no.toString() === filters.semester_no
      );
    }
    
    setFilteredSubjects(result);
  }, [subjects, searchTerm, filters]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://cbcs-project.onrender.com/api/coresubjects/');
      const data = await response.json();
      setSubjects(data);
      setFilteredSubjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.subject_id) newErrors.subject_id = 'Subject ID is required';
    if (!formData.name) newErrors.name = 'Subject name is required';
    if (!formData.department_id) newErrors.department_id = 'Department is required';
    if (!formData.semester_no) newErrors.semester_no = 'Semester is required';
    if (!formData.credit || formData.credit < 0) newErrors.credit = 'Valid credit is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      let response;
      if (editingSubject) {
        // Update existing subject
        response = await fetch(`https://cbcs-project.onrender.com/api/coresubjects/${editingSubject.subject_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new subject
        response = await fetch('https://cbcs-project.onrender.com/api/coresubjects/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      if (response.ok) {
        setSuccessMessage(editingSubject ? 'Subject updated successfully!' : 'Subject created successfully!');
        setShowForm(false);
        setEditingSubject(null);
        setFormData({
          subject_id: '',
          name: '',
          department_id: '',
          semester_no: '',
          credit: ''
        });
        fetchSubjects();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

 const handleEdit = async (subject) => {
   console.log(subject.subject_id);
  try {
    // ✅ Fetch latest subject data from API before editing
    const response = await fetch(`https://cbcs-project.onrender.com/api/coresubjects/${subject.subject_id}`);
    if (!response.ok) {
      console.error("Failed to fetch subject details for edit");
      return;
    }
   
    const subjectData = await response.json();

    setEditingSubject(subjectData);
    setFormData({
      subject_id: subjectData.subject_id,
      name: subjectData.name,
      department_id: subjectData.department_id,
      semester_no: subjectData.semester_no,
      credit: subjectData.credit
    });

    setShowForm(true);
  } catch (error) {
    console.error("Error fetching subject details:", error);
  }
};


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const response = await fetch(`https://cbcs-project.onrender.com/api/coresubjects/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setSuccessMessage('Subject deleted successfully!');
          fetchSubjects();
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      department_id: '',
      semester_no: ''
    });
    setSearchTerm('');
  };

  // Get current subjects for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubjects = filteredSubjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" style={{ backgroundColor: colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border-l-4 py-3 px-4 rounded-md shadow-sm mb-6"
            style={{ backgroundColor: '#F0FDF4', borderColor: colors.accent1, color: '#166534' }}
          >
            <div className="flex items-center">
              <FiCheck className="mr-2" />
              <span>{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center" style={{ color: colors.text }}>
            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: colors.primary }}>
              <FiBook className="text-white" />
            </div>
            Core Subjects Management
          </h1>
          <p className="mt-2" style={{ color: colors.lightText }}>Manage all core subjects in one place</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="py-2 px-4 rounded-lg font-medium flex items-center mt-4 md:mt-0 shadow-md"
          style={{ backgroundColor: colors.primary, color: 'white' }}
        >
          <FiPlus className="mr-2" /> Add New Subject
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-5 shadow-md"
          style={{ backgroundColor: 'white' }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: `${colors.primary}20` }}>
              <FiBook className="text-xl" style={{ color: colors.primary }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold" style={{ color: colors.text }}>{stats.totalSubjects}</h3>
              <p style={{ color: colors.lightText }}>Total Subjects</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-5 shadow-md"
          style={{ backgroundColor: 'white' }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: `${colors.accent1}20` }}>
              <FaUniversity className="text-xl" style={{ color: colors.accent1 }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold" style={{ color: colors.text }}>{Object.keys(stats.byDepartment).length}</h3>
              <p style={{ color: colors.lightText }}>Departments</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-5 shadow-md"
          style={{ backgroundColor: 'white' }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: `${colors.accent2}20` }}>
              <FiLayers className="text-xl" style={{ color: colors.accent2 }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold" style={{ color: colors.text }}>{Object.keys(stats.bySemester).length}</h3>
              <p style={{ color: colors.lightText }}>Active Semesters</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="rounded-xl p-6 mb-8 shadow-md" style={{ backgroundColor: 'white' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Filter Subjects</h2>
          <button
            onClick={resetFilters}
            className="text-sm flex items-center mt-4 md:mt-0"
            style={{ color: colors.lightText }}
          >
            Reset filters <FiX className="ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch style={{ color: colors.lightText }} />
            </div>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:border-blue-500"
              style={{ borderColor: '#E2E8F0' }}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaGraduationCap style={{ color: colors.lightText }} />
            </div>
            <select
              value={filters.department_id}
              onChange={(e) => setFilters({...filters, department_id: e.target.value})}
              className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:border-blue-500 appearance-none"
              style={{ borderColor: '#E2E8F0' }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FiChevronDown style={{ color: colors.lightText }} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaRegClock style={{ color: colors.lightText }} />
            </div>
            <select
              value={filters.semester_no}
              onChange={(e) => setFilters({...filters, semester_no: e.target.value})}
              className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:border-blue-500 appearance-none"
              style={{ borderColor: '#E2E8F0' }}
            >
              <option value="">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FiChevronDown style={{ color: colors.lightText }} />
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="rounded-xl overflow-hidden shadow-md" style={{ backgroundColor: 'white' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr style={{ backgroundColor: `${colors.primary}10` }}>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Subject ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Semester
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Credit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentSubjects.length > 0 ? (
                currentSubjects.map((subject, index) => {
                  const dept = departments.find(d => d.id === subject.department_id);
                  const deptColor = dept ? dept.color : 'bg-gray-100 text-gray-800';
                  
                  return (
                    <motion.tr 
                      key={subject._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: colors.text }}>
                        <div className="flex items-center">
                          <FiAward className="mr-2" style={{ color: colors.primary }} />
                          {subject.subject_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.text }}>
                        {subject.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${deptColor}`}>
                          {dept?.name || subject.department_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.text }}>
                        <div className="flex items-center">
                          <FiClock className="mr-2" style={{ color: colors.accent2 }} />
                          Semester {subject.semester_no}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: colors.text }}>
                        <span className="px-2 py-1 rounded-md" style={{ backgroundColor: `${colors.accent1}20`, color: colors.accent1 }}>
                          {subject.credit} Credits
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="p-1 rounded-md hover:bg-blue-100"
                            style={{ color: colors.primary }}
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(subject._id)}
                            className="p-1 rounded-md hover:bg-red-100"
                            style={{ color: '#E53E3E' }}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm" style={{ color: colors.lightText }}>
                    No subjects found. {searchTerm || filters.department_id || filters.semester_no ? 'Try adjusting your filters.' : 'Add a new subject to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSubjects.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm" style={{ color: colors.lightText }}>
                  Showing <span className="font-medium" style={{ color: colors.text }}>{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium" style={{ color: colors.text }}>
                    {indexOfLastItem > filteredSubjects.length ? filteredSubjects.length : indexOfLastItem}
                  </span> of{' '}
                  <span className="font-medium" style={{ color: colors.text }}>{filteredSubjects.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    style={{ borderColor: '#E2E8F0' }}
                  >
                    <FiArrowLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page 
                          ? 'z-10 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      style={{ 
                        borderColor: '#E2E8F0',
                        backgroundColor: currentPage === page ? colors.primary : 'white',
                        color: currentPage === page ? 'white' : colors.text
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    style={{ borderColor: '#E2E8F0' }}
                  >
                    <FiArrowRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Subject Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowForm(false);
              setEditingSubject(null);
              setFormData({
                subject_id: '',
                name: '',
                department_id: '',
                semester_no: '',
                credit: ''
              });
              setErrors({});
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl shadow-2xl max-w-md w-full p-6"
              style={{ backgroundColor: 'white' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSubject(null);
                    setFormData({
                      subject_id: '',
                      name: '',
                      department_id: '',
                      semester_no: '',
                      credit: ''
                    });
                    setErrors({});
                  }}
                  style={{ color: colors.lightText }}
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="subject_id" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Subject ID
                  </label>
                  <input
                    type="text"
                    id="subject_id"
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 ${errors.subject_id ? 'border-red-500' : ''}`}
                    placeholder="e.g., CS101"
                    style={{ borderColor: errors.subject_id ? '#E53E3E' : '#E2E8F0' }}
                  />
                  {errors.subject_id && <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Subject Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g., Introduction to Programming"
                    style={{ borderColor: errors.name ? '#E53E3E' : '#E2E8F0' }}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="department_id" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Department
                  </label>
                  <select
                    id="department_id"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 appearance-none ${errors.department_id ? 'border-red-500' : ''}`}
                    style={{ borderColor: errors.department_id ? '#E53E3E' : '#E2E8F0' }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.department_id && <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="semester_no" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Semester
                    </label>
                    <select
                      id="semester_no"
                      name="semester_no"
                      value={formData.semester_no}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 appearance-none ${errors.semester_no ? 'border-red-500' : ''}`}
                      style={{ borderColor: errors.semester_no ? '#E53E3E' : '#E2E8F0' }}
                    >
                      <option value="">Select Semester</option>
                      {semesters.map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                    {errors.semester_no && <p className="mt-1 text-sm text-red-600">{errors.semester_no}</p>}
                  </div>

                  <div>
                    <label htmlFor="credit" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Credit
                    </label>
                    <input
                      type="number"
                      id="credit"
                      name="credit"
                      value={formData.credit}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 ${errors.credit ? 'border-red-500' : ''}`}
                      placeholder="e.g., 3"
                      style={{ borderColor: errors.credit ? '#E53E3E' : '#E2E8F0' }}
                    />
                    {errors.credit && <p className="mt-1 text-sm text-red-600">{errors.credit}</p>}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSubject(null);
                      setFormData({
                        subject_id: '',
                        name: '',
                        department_id: '',
                        semester_no: '',
                        credit: ''
                      });
                      setErrors({});
                    }}
                    className="px-4 py-2 border rounded-lg font-medium"
                    style={{ borderColor: '#E2E8F0', color: colors.text }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg font-medium flex items-center shadow-md"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <FiCheck className="mr-2" /> {editingSubject ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoreSubjects;