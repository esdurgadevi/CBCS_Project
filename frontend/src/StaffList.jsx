import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiUsers, 
  FiUser, 
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiX,
  FiStar,
  FiAward,
  FiBriefcase,
  FiGitBranch
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const StaffList = () => {
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeFilters, setActiveFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const navigate = useNavigate();
  const location = useLocation();

  // Get department and domain from location state
  const departmentFromProps = location.state?.department;
  const domainFromProps = location.state?.domain;

  // Determine API endpoint based on props
  const getApiEndpoint = () => {
    if (departmentFromProps && domainFromProps) {
      // Both department and domain are provided
      const deptId = departmentFromProps.dept_id || departmentFromProps.id || departmentFromProps;
      const domainId = domainFromProps.domain_id || domainFromProps.id || domainFromProps;
      return `https://cbcs-project.onrender.com/api/filter/${deptId}/${domainId}`;
    } else if (departmentFromProps) {
      // Only department is provided
      const deptId = departmentFromProps.dept_id || departmentFromProps.id || departmentFromProps;
      return `https://cbcs-project.onrender.com/api/staffs/department/${deptId}`;
    } else if (domainFromProps) {
      // Only domain is provided
      const domainId = domainFromProps.domain_id || domainFromProps.id || domainFromProps;
      return `https://cbcs-project.onrender.com/api/staffs/domain/${domainId}`;
    } else {
      // No props, get all staff
      return 'https://cbcs-project.onrender.com/api/staffs/';
    }
  };

  // Fetch staffs based on props
  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        setLoading(true);
        const endpoint = getApiEndpoint();
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch staff data');
        }
        const data = await response.json();
        setStaffs(data);
        setFilteredStaffs(data);
        
        // Only fetch all departments and domains if we're not in filtered mode
        if (!departmentFromProps && !domainFromProps) {
          const res1 = await fetch(`https://cbcs-project.onrender.com/api/departments`);
          const d1 = await res1.json();
          const res2 = await fetch(`https://cbcs-project.onrender.com/api/domains`);
          const d2 = await res2.json();
          
          const depts = d1.map(dept => ({
            id: dept.dept_id,
            name: dept.dept_name
          }));

          const doms = d2.map(dom => ({
            id: dom.domain_id,
            name: dom.name
          }));
          
          setDepartments(depts);
          setDomains(doms);
        } else {
          // If we're in filtered mode, set departments and domains based on props
          if (departmentFromProps) {
            const dept = {
              id: departmentFromProps.dept_id || departmentFromProps.id || departmentFromProps,
              name: departmentFromProps.dept_name || departmentFromProps.name || 'Selected Department'
            };
            setDepartments([dept]);
            setSelectedDept(dept.id);
          }
          
          if (domainFromProps) {
            const domain = {
              id: domainFromProps.domain_id || domainFromProps.id || domainFromProps,
              name: domainFromProps.name || domainFromProps.label || 'Selected Domain'
            };
            setDomains([domain]);
            setSelectedDomain(domain.id);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, [departmentFromProps, domainFromProps]);

  // Filter staffs based on search and filters (only for local filtering when not in props mode)
  useEffect(() => {
    let result = staffs;

    // Only apply local filters if we're not in a pre-filtered state from props
    const isPreFiltered = departmentFromProps || domainFromProps;
    
    if (!isPreFiltered) {
      if (searchTerm) {
        result = result.filter(staff => 
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.staff_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedDept !== 'all') {
        result = result.filter(staff => staff.dept_id === selectedDept);
      }

      if (selectedDomain !== 'all') {
        result = result.filter(staff => staff.domain_id === selectedDomain);
      }
    } else {
      // If we're pre-filtered by props, only apply search
      if (searchTerm) {
        result = result.filter(staff => 
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.staff_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    setFilteredStaffs(result);
    setActiveFilters(searchTerm || selectedDept !== 'all' || selectedDomain !== 'all');
  }, [searchTerm, selectedDept, selectedDomain, staffs, departmentFromProps, domainFromProps]);

  const handleViewDetails = (staff) => {
    navigate(`/staffdetails/${staff.staff_id}`)
  };

  const handleBackToList = () => {
    setSelectedStaff(null);
  };

  const getGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    ];
    return gradients[index % gradients.length];
  };

  const getAvatarColor = (name) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a8edea'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handlecreate = () => {
    //navigate('/staff-create')
    navigate('/staff-create', {
      state: { department:  departmentFromProps}
    });
  };

  const getImageUrl = (staff) => {
    if (staff.image && staff.image.data) {
      return `data:${staff.image.contentType};base64,${btoa(
        new Uint8Array(staff.image.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      )}`;
    }
    return null;
  };

  // Check if we're in a pre-filtered mode
  const isPreFiltered = departmentFromProps || domainFromProps;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading our amazing team...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto my-5 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl text-center shadow-lg"
        >
          <h4 className="font-bold text-xl mb-2">Oops! Something went wrong</h4>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // If staff is selected, show details view
  if (selectedStaff) {
    return <StaffDetails staff={selectedStaff} onBack={handleBackToList} />;
  }

  // Main Staff List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl mb-6"
          >
            <FiUsers className="text-white text-3xl" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isPreFiltered ? 'Filtered Team Members' : 'Meet Our Dream Team'}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {isPreFiltered 
              ? `Showing staff members based on your selection` 
              : 'Discover the brilliant minds driving innovation and excellence in our organization'
            }
          </p>
        </motion.div>

        {/* Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-6 mb-8 text-white relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-wrap items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{filteredStaffs.length} Amazing People</h2>
              <p className="opacity-90 text-blue-100">
                {isPreFiltered 
                  ? `Filtered view ${departmentFromProps ? `• Department: ${departmentFromProps.dept_name || departmentFromProps.name || 'Selected'}` : ''} ${domainFromProps ? `• Domain: ${domainFromProps.name || domainFromProps.label || 'Selected'}` : ''}`
                  : `Spanning ${departments.length} departments • ${domains.length} specialized domains`
                }
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-full flex items-center mt-4 md:mt-0 shadow-lg"
              onClick={handlecreate}
            >
              <FiPlus className="mr-2" /> Add Team Member
            </motion.button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-16 -mr-16"></div>
        </motion.div>

        {/* Filters and Controls - Only show if not pre-filtered */}
        {!isPreFiltered && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, ID, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-300 focus:border-transparent text-lg"
                />
              </div>
              
              {/* Department Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiBriefcase className="text-gray-400" />
                </div>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="pl-12 w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-300 focus:border-transparent appearance-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept, index) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <FiChevronDown className="text-gray-400" />
                </div>
              </div>
              
              {/* Domain Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiGitBranch className="text-gray-400" />
                </div>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="pl-12 w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-300 focus:border-transparent appearance-none"
                >
                  <option value="all">All Domains</option>
                  {domains.map((domain, index) => (
                    <option key={domain.id} value={domain.id}>{domain.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <FiChevronDown className="text-gray-400" />
                </div>
              </div>
            </div>
            
            {activeFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 flex items-center justify-between"
              >
                <span className="text-sm text-gray-600">Active filters applied</span>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 px-4 rounded-full flex items-center shadow"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDept('all');
                    setSelectedDomain('all');
                  }}
                >
                  Clear all filters
                  <FiX className="ml-1" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Results Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-between items-center mb-8"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {isPreFiltered ? 'Filtered Team' : 'Team Members'} <span className="text-blue-500">({filteredStaffs.length})</span>
            </h3>
            <p className="text-gray-600">
              {isPreFiltered 
                ? `Showing ${filteredStaffs.length} staff members`
                : `Showing ${filteredStaffs.length} of ${staffs.length} incredible professionals`
              }
            </p>
          </div>
          
          <div className="flex space-x-2 bg-white rounded-2xl p-1 shadow-lg">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              List
            </button>
          </div>
        </motion.div>

        {/* Staff Cards Grid */}
        {filteredStaffs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-3xl shadow-xl"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl mb-6">
              <FiUser className="text-blue-500 text-3xl" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-2">No team members found</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              {isPreFiltered 
                ? 'No staff members found for the selected criteria.'
                : 'Try adjusting your search criteria or filters to find what you\'re looking for.'
              }
            </p>
          </motion.div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            <AnimatePresence>
              {filteredStaffs.map((staff, index) => (
                <motion.div
                  key={staff.staff_id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Gradient Header */}
                  <div 
                    className="h-2 w-full"
                    style={{ background: getGradient(index) }}
                  ></div>
                  
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="relative">
                         <img 
                            src={`https://cbcs-project.onrender.com/${staff.image}`} 
                            alt={staff.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
                          />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
                          <FiStar className="text-xs" />
                        </div>
                      </div>
                      
                      {/* Basic Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-xl truncate">{staff.name}</h3>            
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                            {staff.dept_id}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewDetails(staff)}
                      className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center shadow-lg transition-all duration-300"
                    >
                      <FiUser className="mr-2" />
                      View Full Profile
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-gray-500"
        >
          <p>© 2024 Amazing Team • {filteredStaffs.length} professionals making a difference</p>
        </motion.div>
      </div>
    </div>
  );
};

export default StaffList;