//use
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff, FiBook, FiAward } from 'react-icons/fi';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 🔹 Login Handler (connects to your backend)
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Login successful! Redirecting...');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        setTimeout(() => {
          if (loginData.role === 'admin') {
            window.location.href = '/admin-dashboard';
          } else if (loginData.role === 'faculty') {
            window.location.href = '/faculty-dashboard';
          } else {
            window.location.href = '/student-dashboard';
          }
        }, 1200);
      } else {
        setMessage(data.error || '❌ Invalid credentials');
      }
    } catch (err) {
      setMessage('⚠️ Network error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Forgot Password Handler (connects to your backend)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('📧 Password reset instructions sent to your email.');
      } else {
        setMessage(data.error || '❌ Failed to process request.');
      }
    } catch (err) {
      setMessage('⚠️ Network error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-800 via-blue-600 to-green-500 text-white">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-md"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm mr-3">
              <FiBook className="text-3xl text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
              CBCS Portal
            </h1>
          </div>
          <h2 className="text-3xl font-bold mb-4">Choice Based Credit System</h2>
          <p className="text-lg text-blue-100 mb-8">
            Manage courses, track credits, and access role-based dashboards in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <FiAward className="text-2xl text-yellow-300 mx-auto mb-2" />
              <p>Credit Tracking</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <FiUser className="text-2xl text-green-300 mx-auto mb-2" />
              <p>Role-Based Access</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <FiBook className="text-2xl text-blue-300 mx-auto mb-2" />
              <p>Course Management</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            {isForgotPassword ? '🔑 Reset Your Password' : '🔓 Login to Your Account'}
          </h2>

          {message && (
            <div className={`p-3 rounded-lg mb-4 text-center ${message.includes('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {message}
            </div>
          )}

          {!isForgotPassword ? (
            <form onSubmit={handleLogin}>
              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-blue-200 mb-2">Login As</label>
                <div className="grid grid-cols-3 gap-2">
                  {['student', 'faculty', 'admin'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        loginData.role === role
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-blue-200 hover:bg-white/20'
                      }`}
                      onClick={() => setLoginData({ ...loginData, role })}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username */}
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  className="text-yellow-300 hover:text-yellow-100 text-sm"
                  onClick={() => setIsForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </button>

                <button
                  type="button"
                  className="w-full py-3 px-4 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all"
                  onClick={() => setIsForgotPassword(false)}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
