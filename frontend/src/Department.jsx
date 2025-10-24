import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, ChevronLeft, Users, BookOpen, Globe } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    dept_id: '',
    dept_name: '',
    staffs: [],
    core_subjects: [],
    domains: []
  });

  // Fetch all departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments');
      const data = await response.json();
      setDepartments(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setIsLoading(false);
    }
  };

  const fetchDepartmentDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/departments/${id}`);
      const data = await response.json();
      setSelectedDept(data);
    } catch (error) {
      console.error('Error fetching department details:', error);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setShowAddForm(false);
        setFormData({ dept_id: '', dept_name: '', staffs: [], core_subjects: [], domains: [] });
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/departments/${editingDept._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setEditingDept(null);
        setFormData({ dept_id: '', dept_name: '', staffs: [], core_subjects: [], domains: [] });
        fetchDepartments();
        if (selectedDept && selectedDept._id === editingDept._id) {
          fetchDepartmentDetails(editingDept._id);
        }
      }
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/departments/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchDepartments();
          if (selectedDept && selectedDept._id === id) {
            setSelectedDept(null);
          }
        }
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const openEditForm = (dept) => {
    setEditingDept(dept);
    setFormData({
      dept_id: dept.dept_id,
      dept_name: dept.dept_name,
      staffs: [...dept.staffs],
      core_subjects: [...dept.core_subjects],
      domains: [...dept.domains]
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <AnimatePresence mode="wait">
        {editingDept ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="row justify-content-center"
          >
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white py-3">
                  <h4 className="mb-0">Edit Department</h4>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleUpdateDepartment}>
                    <div className="mb-3">
                      <label className="form-label">Department ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dept_id}
                        onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Department Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dept_name}
                        onChange={(e) => setFormData({ ...formData, dept_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-success flex-fill">
                        Update Department
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditingDept(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        ) : showAddForm ? (
          <motion.div
            key="add-form"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="row justify-content-center"
          >
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-success text-white py-3">
                  <h4 className="mb-0">Add New Department</h4>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleAddDepartment}>
                    <div className="mb-3">
                      <label className="form-label">Department ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dept_id}
                        onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Department Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dept_name}
                        onChange={(e) => setFormData({ ...formData, dept_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary flex-fill">
                        Add Department
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        ) : selectedDept ? (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <div className="mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={() => setSelectedDept(null)}
              >
                <ChevronLeft size={20} className="me-1" /> Back to Departments
              </motion.button>
            </div>

            <div className="card shadow-lg border-0 overflow-hidden">
              <div className="card-header bg-gradient-primary text-white py-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="mb-0">{selectedDept.dept_name}</h2>
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn btn-light me-2"
                      onClick={() => openEditForm(selectedDept)}
                    >
                      <Edit size={18} className="me-1" /> Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn btn-danger"
                      onClick={() => handleDeleteDepartment(selectedDept._id)}
                    >
                      <Trash2 size={18} className="me-1" /> Delete
                    </motion.button>
                  </div>
                </div>
                <p className="mb-0 mt-2">ID: {selectedDept.dept_id}</p>
              </div>
              
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-4 mb-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="card h-100 border-0 shadow-sm"
                    >
                      <div className="card-header bg-info text-white d-flex align-items-center">
                        <Users className="me-2" size={20} />
                        <h5 className="mb-0">Staff Members</h5>
                      </div>
                      <div className="card-body">
                        {selectedDept.staffs && selectedDept.staffs.length > 0 ? (
                          <ul className="list-group list-group-flush">
                            {selectedDept.staffs.map((staff, index) => (
                              <motion.li 
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 * index }}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                {staff}
                                <div>
                                  <button className="btn btn-sm btn-outline-primary me-1">
                                    <Edit size={14} />
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No staff members assigned</p>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-success mt-3 w-100"
                        >
                          <Plus size={18} className="me-1" /> Add Staff
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  <div className="col-md-4 mb-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="card h-100 border-0 shadow-sm"
                    >
                      <div className="card-header bg-warning text-dark d-flex align-items-center">
                        <BookOpen className="me-2" size={20} />
                        <h5 className="mb-0">Core Subjects</h5>
                      </div>
                      <div className="card-body">
                        {selectedDept.core_subjects && selectedDept.core_subjects.length > 0 ? (
                          <ul className="list-group list-group-flush">
                            {selectedDept.core_subjects.map((subject, index) => (
                              <motion.li 
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 * index }}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                {subject}
                                <div>
                                  <button className="btn btn-sm btn-outline-primary me-1">
                                    <Edit size={14} />
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No core subjects assigned</p>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-success mt-3 w-100"
                        >
                          <Plus size={18} className="me-1" /> Add Subject
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  <div className="col-md-4 mb-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="card h-100 border-0 shadow-sm"
                    >
                      <div className="card-header bg-purple text-white d-flex align-items-center">
                        <Globe className="me-2" size={20} />
                        <h5 className="mb-0">Domains</h5>
                      </div>
                      <div className="card-body">
                        {selectedDept.domains && selectedDept.domains.length > 0 ? (
                          <ul className="list-group list-group-flush">
                            {selectedDept.domains.map((domain, index) => (
                              <motion.li 
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 * index }}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                {domain}
                                <div>
                                  <button className="btn btn-sm btn-outline-primary me-1">
                                    <Edit size={14} />
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No domains assigned</p>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-success mt-3 w-100"
                        >
                          <Plus size={18} className="me-1" /> Add Domain
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="display-5 fw-bold text-primary">Departments</h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary d-flex align-items-center"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={20} className="me-1" /> Add Department
              </motion.button>
            </div>

            <div className="row">
              {departments.map((dept, index) => (
                <div key={dept._id} className="col-md-6 col-lg-4 mb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="card h-100 border-0 shadow-sm overflow-hidden department-card"
                  >
                    <div className="card-img-top bg-gradient-primary department-header">
                      <div className="d-flex justify-content-between align-items-center p-3 text-white">
                        <h5 className="mb-0">{dept.dept_name}</h5>
                        <span className="badge bg-light text-primary">ID: {dept.dept_id}</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-around text-center py-2">
                        <div>
                          <Users size={24} className="text-info mb-1" />
                          <h6 className="mb-0">{dept.staffs?.length || 0}</h6>
                          <small className="text-muted">Staff</small>
                        </div>
                        <div>
                          <BookOpen size={24} className="text-warning mb-1" />
                          <h6 className="mb-0">{dept.core_subjects?.length || 0}</h6>
                          <small className="text-muted">Subjects</small>
                        </div>
                        <div>
                          <Globe size={24} className="text-purple mb-1" />
                          <h6 className="mb-0">{dept.domains?.length || 0}</h6>
                          <small className="text-muted">Domains</small>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-transparent border-0 d-flex justify-content-between p-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => fetchDepartmentDetails(dept._id)}
                      >
                        View Details
                      </motion.button>
                      <div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-outline-secondary btn-sm me-1"
                          onClick={() => openEditForm(dept)}
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteDepartment(dept._id)}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
        }
        .bg-purple {
          background-color: #6f42c1 !important;
        }
        .department-card {
          transition: all 0.3s ease;
        }
        .department-card:hover {
          box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15) !important;
        }
        .department-header {
          height: 80px;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default Department;