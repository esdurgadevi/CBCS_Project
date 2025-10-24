import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEye, 
  FiBook, 
  FiCalendar, 
  FiSearch,
  FiRefreshCw,
  FiUsers,
  FiFileText,
  FiArrowRight,
  FiFilter,
  FiHome
} from 'react-icons/fi';

const CBCSList = ({ department = null }) => {
  const [cbcsList, setCbcsList] = useState([]);
  const [filteredCbcsList, setFilteredCbcsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCBCSList();
  }, []);

  useEffect(() => {
    // Apply filters whenever search term, active filter, or department changes
    applyFilters();
  }, [searchTerm, activeFilter, department, cbcsList]);

  const fetchCBCSList = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/student_cbcs');
      if (!response.ok) {
        throw new Error('Failed to fetch CBCS data');
      }
      const data = await response.json();
      
      let fetchedData = [];
      if (Array.isArray(data)) {
        fetchedData = data;
      } else if (data.data && Array.isArray(data.data)) {
        fetchedData = data.data;
      } else if (data.cbcsList && Array.isArray(data.cbcsList)) {
        fetchedData = data.cbcsList;
      } else {
        console.error('Unexpected API response format:', data);
        setError('Unexpected data format received from server');
        fetchedData = [];
      }
      
      setCbcsList(fetchedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setCbcsList([]);
    }
  };

  const applyFilters = () => {
    let filtered = cbcsList.filter(cbcs => {
      // Department filter - if department prop is provided, filter by it
      const matchesDepartment = !department || 
        cbcs.department?.toLowerCase() === department.toLowerCase();
      
      // Search filter
      const matchesSearch = 
        cbcs.cbcs_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cbcs.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cbcs.batch?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Active filter
      const matchesFilter = 
        activeFilter === 'all' || 
        (activeFilter === 'recent' && cbcs.semester >= 3) ||
        (activeFilter === 'new' && cbcs.semester <= 2);
      
      return matchesDepartment && matchesSearch && matchesFilter;
    });
    
    setFilteredCbcsList(filtered);
  };

  const handleViewDetails = (id) => {
    navigate(`/cbcsdetails/${id}`);
  };

  const handleViewAllDepartments = () => {
    // Navigate to the general CBCS page or reset department filter
    if (department) {
      // If you want to navigate to a general page
      navigate('/cbcs'); // or whatever your general route is
    }
  };

  // Animation variants
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
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Calculate stats based on current view
  const currentList = department ? cbcsList.filter(cbcs => 
    cbcs.department?.toLowerCase() === department.toLowerCase()
  ) : cbcsList;

  const totalCBCS = currentList.length;
  const activeSemesters = new Set(currentList.map(c => c.semester)).size;
  const departmentsCount = department ? 1 : new Set(currentList.map(c => c.department)).size;

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F2F2F2' }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="mb-6 mx-auto w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent"
          ></motion.div>
          <p className="text-xl font-semibold" style={{ color: '#3A6D8C' }}>Loading CBCS Data</p>
          <p className="text-gray-500 mt-2">Please wait while we fetch the latest information</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: '#F2F2F2' }}
      >
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFileText className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(58, 109, 140, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchCBCSList}
            className="px-6 py-3 rounded-xl text-white font-semibold w-full"
            style={{ backgroundColor: '#3A6D8C' }}
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F2F2F2' }}>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold" style={{ color: '#3A6D8C' }}>
                {department ? `${department} CBCS` : 'All CBCS Programs'}
              </h1>
              {department && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewAllDepartments}
                  className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 flex items-center gap-2 text-sm"
                >
                  <FiHome size={14} />
                  View All
                </motion.button>
              )}
            </div>
            <p className="text-gray-600">
              {department 
                ? `Managing CBCS programs for ${department} department`
                : 'Manage and view all Choice Based Credit Systems'
              }
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(58, 109, 140, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchCBCSList}
            className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-white font-semibold shadow-lg"
            style={{ backgroundColor: '#3A6D8C' }}
          >
            <FiRefreshCw /> Refresh Data
          </motion.button>
        </div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 shadow-lg border-l-4"
            style={{ borderLeftColor: '#3A6D8C' }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  {department ? 'Department CBCS' : 'Total CBCS'}
                </p>
                <h3 className="text-2xl font-bold" style={{ color: '#3A6D8C' }}>{totalCBCS}</h3>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(58, 109, 140, 0.1)' }}>
                <FiBook className="text-xl" style={{ color: '#3A6D8C' }} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 shadow-lg border-l-4"
            style={{ borderLeftColor: '#A0C49D' }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Active Semesters</p>
                <h3 className="text-2xl font-bold" style={{ color: '#A0C49D' }}>{activeSemesters}</h3>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(160, 196, 157, 0.1)' }}>
                <FiCalendar className="text-xl" style={{ color: '#A0C49D' }} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 shadow-lg border-l-4"
            style={{ borderLeftColor: '#FFD60A' }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  {department ? 'Current Department' : 'Departments'}
                </p>
                <h3 className="text-2xl font-bold" style={{ color: '#FFD60A' }}>{departmentsCount}</h3>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(255, 214, 10, 0.1)' }}>
                <FiUsers className="text-xl" style={{ color: '#FFD60A' }} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-lg mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={
                  department 
                    ? `Search ${department} CBCS by ID or batch...`
                    : "Search by ID, department, or batch..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex gap-2">
              {['all', 'recent', 'new'].map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    activeFilter === filter 
                      ? 'text-white' 
                      : 'text-gray-600 bg-gray-100'
                  }`}
                  style={{ 
                    backgroundColor: activeFilter === filter ? '#3A6D8C' : '' 
                  }}
                >
                  {filter}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-600 flex items-center gap-2"
            >
              <FiFilter /> More Filters
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* CBCS List Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: '#3A6D8C' }}>
              <FiBook /> 
              {department ? `${department} CBCS Programs` : 'All CBCS Programs'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredCbcsList.length} of {currentList.length})
              </span>
            </h2>
          </div>
          
          {filteredCbcsList.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {department ? `No CBCS programs found for ${department}` : 'No CBCS programs found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search query' : 'No CBCS data available yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: '#3A6D8C' }}>CBCS ID</th>
                    {!department && (
                      <th className="text-left py-4 px-4 font-semibold" style={{ color: '#3A6D8C' }}>Department</th>
                    )}
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: '#3A6D8C' }}>Batch</th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: '#3A6D8C' }}>Semester</th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: '#3A6D8C' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredCbcsList.map((cbcs, index) => (
                      <motion.tr
                        key={cbcs._id || cbcs.cbcs_id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundColor: '#3A6D8C' }}>
                              {cbcs.department?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <div className="font-semibold" style={{ color: '#3A6D8C' }}>
                                {cbcs.cbcs_id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {cbcs.subjects?.length || 0} subjects
                              </div>
                            </div>
                          </div>
                        </td>
                        {!department && (
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-800">{cbcs.department}</div>
                          </td>
                        )}
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-800">{cbcs.batch}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Semester {cbcs.semester}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(58, 109, 140, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewDetails(cbcs.cbcs_id)}
                            className="px-4 py-2 rounded-lg flex items-center gap-2 text-white text-sm font-medium"
                            style={{ backgroundColor: '#3A6D8C' }}
                          >
                            <FiEye size={16} />
                            View Details
                            <FiArrowRight size={14} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CBCSList;