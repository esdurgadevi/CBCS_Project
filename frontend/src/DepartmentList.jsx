import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, 
  FiX, FiUsers, FiChevronRight
} from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
const DepartmentList = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({ dept_id: '', dept_name: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://cbcs-project.onrender.com/api/departments/');
      if (!response.ok) throw new Error('Failed to fetch departments');
      
      const data = await response.json();
      setDepartments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setLoading(false);
      
      // fallback mock data
      const mockData = [
        { dept_id: 'D001', dept_name: 'Computer Science', staffs: 24, core_subjects: 12, domains: 5 },
        { dept_id: 'D002', dept_name: 'Electrical Engineering', staffs: 18, core_subjects: 10, domains: 4 },
        { dept_id: 'D003', dept_name: 'Mechanical Engineering', staffs: 22, core_subjects: 11, domains: 6 },
      ];
      setDepartments(mockData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingDepartment 
        ? `https://cbcs-project.onrender.com/api/departments/${editingDepartment.dept_id}`
        : 'https://cbcs-project.onrender.com/api/departments/';
      
      const method = editingDepartment ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save department');

      if (editingDepartment) {
        setDepartments(departments.map(dept => 
          dept.dept_id === editingDepartment.dept_id 
            ? { ...dept, ...formData } 
            : dept
        ));
      } else {
        const newDept = { 
          ...formData, 
          staffs: Math.floor(Math.random() * 20) + 5,
          core_subjects: Math.floor(Math.random() * 10) + 3,
          domains: Math.floor(Math.random() * 5) + 1
        };
        setDepartments([...departments, newDept]);
      }

      setShowModal(false);
      setFormData({ dept_id: '', dept_name: '' });
      setEditingDepartment(null);
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      const response = await fetch(`https://cbcs-project.onrender.com/api/departments/${deptId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete department');
      setDepartments(departments.filter(dept => dept.dept_id !== deptId));
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({ dept_id: department.dept_id, dept_name: department.dept_name });
    setShowModal(true);
  };

  const handleCreate = () => {
    navigate('/create-domain');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.dept_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.dept_id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleViewDetails = (dept) => {
  navigate(`/departments/${dept.dept_id}`, { state: { department: dept } });
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-[#3A6D8C] border-t-transparent"
        ></motion.div>
        <p className="ml-3 text-[#3A6D8C] font-medium">Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          className="flex items-center justify-center px-4 py-2 bg-[#3A6D8C] text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          <FiPlus className="mr-2" />
          Add Department
        </motion.button>
      </motion.div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredDepartments.map((dept, index) => (
            <motion.div
              key={dept.dept_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
            >
              <div className="h-2 bg-gradient-to-r from-blue-600 to-green-500"></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {dept.dept_id}
                  </span>
                  <div className="flex space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(dept)}
                      className="p-1.5 text-blue-400 hover:text-blue-600 rounded-lg"
                    >
                      <FiEdit2 size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(dept.dept_id)}
                      className="p-1.5 text-blue-400 hover:text-red-500 rounded-lg"
                    >
                      <FiTrash2 size={16} />
                    </motion.button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{dept.dept_name}</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-800">{dept.staffs.length}</div>
                    <div className="text-xs text-blue-600">Staff</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-800">{dept.core_subjects.length}</div>
                    <div className="text-xs text-green-600">Subjects</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-800">{dept.domains.length}</div>
                    <div className="text-xs text-purple-600">Domains</div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ x: 5 }}
                  className="w-full flex items-center justify-center py-2 bg-[#3A6D8C] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                   onClick={() => handleViewDetails(dept)}
                >
                  <span>View details</span>
                  <FiChevronRight className="ml-1" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredDepartments.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-xl border border-gray-200 mt-5"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FiUsers className="text-2xl text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-blue-800 mb-2">No departments found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search term' : 'Get started by adding your first department'}
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="mt-5 px-4 py-2 bg-[#3A6D8C] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
          >
            Add Department
          </motion.button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-green-500 text-white">
                <h3 className="text-lg font-semibold">
                  {editingDepartment ? 'Edit Department' : 'Add Department'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="mb-4">
                  <label htmlFor="dept_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Department ID
                  </label>
                  <input
                    type="text"
                    id="dept_id"
                    value={formData.dept_id}
                    onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                    required
                    disabled={!!editingDepartment}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-all"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="dept_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    id="dept_name"
                    value={formData.dept_name}
                    onChange={(e) => setFormData({ ...formData, dept_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#3A6D8C] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingDepartment ? 'Update' : 'Create'}
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

export default DepartmentList;
