import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGitBranch, 
  FiSearch, 
  FiPlus, 
  FiEye, 
  FiChevronRight,
  FiFilter,
  FiGrid,
  FiList,
  FiUsers,
  FiBook,
  FiAward
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const DomainList = () => {
  const [domains, setDomains] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get department from location state
  const deptFromProps = location.state?.department;

  // Fetch domains and department details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!deptFromProps) {
          throw new Error('No department provided');
        }

        // Get department ID (handle both object and string)
        const deptId = typeof deptFromProps === 'string' 
          ? deptFromProps 
          : deptFromProps.dept_id || deptFromProps.id || deptFromProps;

        // Fetch department details
        const deptResponse = await fetch(`http://localhost:5000/api/departments/${deptId}`);
        if (!deptResponse.ok) {
          throw new Error('Failed to fetch department details');
        }
        const deptData = await deptResponse.json();
        setDepartment(deptData);

        // Fetch domains for the department
        const domainsResponse = await fetch(`http://localhost:5000/api/domains/dept/${deptId}`);
        if (!domainsResponse.ok) {
          throw new Error('Failed to fetch domains');
        }
        const domainsData = await domainsResponse.json();
        
        setDomains(domainsData);
        setFilteredDomains(domainsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deptFromProps]);

  // Filter domains based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = domains.filter(domain =>
        domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.domain_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDomains(filtered);
    } else {
      setFilteredDomains(domains);
    }
  }, [searchTerm, domains]);

  const handleViewDetails = (domain) => {
    navigate(`/domaindetails/${domain.domain_id}`, {
      state: { domain }
    });
  };

  const handleCreateDomain = () => {
    // Navigate to create domain page
    navigate('/create-domain', {
      state: { department: department }
    });
  };

  const handleBack = () => {
    navigate(-1);
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

  const getStatsForDomain = (domain) => {
    // You can enhance this with actual API calls for staff and subject counts
    return {
      staffCount: domain.staffs?.length || 0,
      subjectCount: domain.subjects?.length || 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading domains...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiGitBranch className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Domains</h3>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
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
            className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl shadow-2xl mb-6"
          >
            <FiGitBranch className="text-white text-3xl" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Specialized Domains
          </h1>
          {department && (
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Exploring specialized domains within the <strong>{department.dept_name}</strong> department
            </p>
          )}
        </motion.div>

        {/* Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl shadow-2xl p-6 mb-8 text-white relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-wrap items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{domains.length} Specialized Domains</h2>
              <p className="opacity-90 text-purple-100">
                {department && `In ${department.dept_name} Department`}
                {domains.length > 0 && ` • ${domains.reduce((acc, domain) => acc + (domain.staffs?.length || 0), 0)} Total Staff Members`}
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-600 hover:bg-purple-50 font-semibold py-3 px-6 rounded-full flex items-center mt-4 md:mt-0 shadow-lg"
              onClick={handleCreateDomain}
            >
              <FiPlus className="mr-2" /> Add New Domain
            </motion.button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-16 -mr-16"></div>
        </motion.div>

        {/* Search and Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder="Search domains by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-300 focus:border-transparent text-lg"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl ${viewMode === 'grid' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl ${viewMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'}`}
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {searchTerm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex items-center justify-between"
            >
              <span className="text-sm text-gray-600">
                Found {filteredDomains.length} of {domains.length} domains
              </span>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 py-2 px-4 rounded-full flex items-center shadow"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Results Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-between items-center mb-8"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Domains <span className="text-purple-500">({filteredDomains.length})</span>
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `Search results for "${searchTerm}"`
                : `All specialized domains in ${department?.dept_name || 'the department'}`
              }
            </p>
          </div>
        </motion.div>

        {/* Domains Grid/List */}
        {filteredDomains.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-3xl shadow-xl"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl mb-6">
              <FiGitBranch className="text-purple-500 text-3xl" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-2">No domains found</h4>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm 
                ? 'No domains match your search criteria. Try different keywords.'
                : 'No domains have been created for this department yet.'
              }
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateDomain}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
              >
                <FiPlus className="inline mr-2" />
                Create First Domain
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            <AnimatePresence>
              {filteredDomains.map((domain, index) => {
                const stats = getStatsForDomain(domain);
                
                return (
                  <motion.div
                    key={domain._id}
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
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                            <FiGitBranch className="text-white text-xl" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">{domain.name}</h3>
                            <p className="text-gray-500 text-sm">ID: {domain.domain_id}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                            Active
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <FiUsers className="text-blue-500 mx-auto mb-1" />
                          <div className="text-lg font-bold text-gray-800">{stats.staffCount}</div>
                          <div className="text-xs text-gray-600">Staff</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <FiBook className="text-green-500 mx-auto mb-1" />
                          <div className="text-lg font-bold text-gray-800">{stats.subjectCount}</div>
                          <div className="text-xs text-gray-600">Subjects</div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleViewDetails(domain)}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
                      >
                        <FiEye className="mr-1" />
                        View Domain Details
                        <FiChevronRight className="ml-1" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
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
          <p>
            © 2024 Domain Management • 
            {department && ` ${department.dept_name} Department •`}
            {` ${domains.length} specialized domains`}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DomainList;