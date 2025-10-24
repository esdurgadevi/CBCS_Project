import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CBCSList from './CBCSList';
import {
  FiHome, FiBook, FiUsers, FiLayers, FiBookOpen,
  FiBarChart2, FiSettings, FiLogOut, FiMenu, FiX,
  FiAward, FiUser
} from 'react-icons/fi';
import DepartmentList from './DepartmentList';
import CBCSForm from './CBCSForm';
import StaffList from './StaffList';
import DomainCBCSForm from './DomainCBCSForm';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stats, setStats] = useState({
    departments: 0,
    domains: 0,
    coreSubjects: 0,
    electives: 0,
    staffs: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, coreRes, electiveRes, staffRes] = await Promise.all([
          fetch('http://localhost:5000/api/departments').then(res => res.json()),
          fetch('http://localhost:5000/api/coresubjects').then(res => res.json()),
          fetch('http://localhost:5000/api/electives').then(res => res.json()),
          fetch('http://localhost:5000/api/staffs').then(res => res.json()),
        ]);

        setStats({
          departments: deptRes.length,
          coreSubjects: coreRes.length,
          electives: electiveRes.length,
          staffs: staffRes.length,
        });

        setCoreCBCS(coreRes);
        setElectiveCBCS(electiveRes);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);
  const handleLogout = () => {
  localStorage.removeItem("token"); // Remove JWT
  window.location.href = "/";  // Redirect to login page
};
  return (
    <div className="flex h-screen bg-[#F2F2F2] overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-64 bg-gradient-to-b from-blue-800 to-blue-900 shadow-xl z-10"
          >
            <div className="p-5 border-b border-blue-700">
              <h1 className="text-xl font-bold text-white flex items-center">
                <FiAward className="mr-2 text-yellow-400" />
                CBCS Admin
              </h1>
              <p className="text-blue-200 text-sm">Choice Based Credit System</p>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {[{ id: 'dashboard', name: 'Dashboard', icon: FiHome },
                  { id: 'core', name: 'Core CBCS', icon: FiBook },
                  { id: 'elective', name: 'Elective CBCS', icon: FiBookOpen },
                  { id: 'departments', name: 'Departments', icon: FiUsers },
                  { id: 'cbcs-list', name: 'CBCS List', icon: FiBook },
                  { id: 'results', name: 'View Results', icon: FiBarChart2 },
                  { id: 'staffs', name: 'Staffs', icon: FiUsers },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                        activeTab === item.id
                          ? 'bg-blue-700 text-white shadow-inner'
                          : 'text-blue-200 hover:bg-blue-700/50 hover:text-white'
                      }`}
                    >
                      <item.icon className="mr-3" />
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="absolute bottom-0 w-full p-4 border-t border-blue-700">
              <button className="w-full flex items-center px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-700/50 hover:text-white transition-all"
               onClick={handleLogout}>
                <FiLogOut className="mr-3" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg mr-4 text-blue-800 hover:bg-blue-100"
              >
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <h2 className="text-xl font-semibold text-blue-800 capitalize">
                {activeTab.replace(/([A-Z])/g, ' $1')}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <span className="pl-10 pr-4 py-2 text-gray-700">Admin User</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Departments', value: stats.departments, icon: FiUsers, color: 'from-blue-500 to-blue-600' },
                { title: 'Core Subjects', value: stats.coreSubjects, icon: FiBook, color: 'from-green-500 to-green-600' },
                { title: 'Elective Subjects', value: stats.electives, icon: FiBookOpen, color: 'from-yellow-500 to-yellow-600' },
                { title: 'Staffs', value: stats.staffs, icon: FiUsers, color: 'from-pink-500 to-pink-600' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="text-white text-xl" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'core' && <CBCSForm /> }
          {activeTab === 'elective' && <DomainCBCSForm />}
          {activeTab === 'cbcs-list' && <CBCSList />}
          {activeTab === 'departments' && <DepartmentList />}
          {activeTab === 'results' && <Results />}
          {activeTab === 'staffs' && <StaffList />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
