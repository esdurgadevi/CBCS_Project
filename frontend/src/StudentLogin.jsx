import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiBook, FiArrowRight, FiAward, FiPhone, FiLock, FiCheck } from 'react-icons/fi';
import { FaGraduationCap, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const StudentLogin = () => {
  const { type,id } = useParams();
  const [formData, setFormData] = useState({
    regno: '',
    name: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log(formData.regno);
    
    try {
      const response = await fetch('http://localhost:5000/api/otp/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regno: formData.regno,
          name: formData.name,
          email: formData.email
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setOtpSent(true);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    
    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    try{
       const response = await fetch('http://localhost:5000/api/otp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regno: formData.regno,
          otp:enteredOtp
        })
      });
      const data = await response.json();
      if (response.ok) {
        console.log(id);
         window.location.href = `http://localhost:5173/student-dashboard/${type}/${id}/${formData.regno}`;
      } else {
        setError(data.message || 'Not a valid otp');
      }
    }
    catch(err)
    {
        setError("Network error");
    }
    
    // Verify OTP (you would typically make another API call here)
    // For now, we'll just navigate after OTP entr
  };
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Panel - Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full lg:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 flex flex-col justify-between"
        >
          {/* ... (left panel content remains the same) ... */}
        </motion.div>

        {/* Right Panel - Login/Register Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full lg:w-3/5 bg-white p-10 flex flex-col justify-center"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Student Portal
            </h2>
            <p className="text-gray-600">
              Enter your details to access the CBCS system
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {otpSent ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FiAward className="text-2xl text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                OTP Sent Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Please check your email for the 6-digit verification code
              </p>
              
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center space-x-2">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onFocus={e => e.target.select()}
                      className="w-12 h-12 border-2 rounded-md text-center text-xl font-semibold"
                    />
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 px-4 font-bold text-lg shadow-md"
                >
                  Verify OTP
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="regno">
                  Registration Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBook className="text-gray-400" />
                  </div>
                  <input
                    id="regno"
                    name="regno"
                    type="text"
                    value={formData.regno}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full pl-10 p-3.5"
                    placeholder="Enter your registration number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full pl-10 p-3.5"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full pl-10 p-3.5"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 px-4 font-bold text-lg shadow-md flex items-center justify-center"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
                {!loading && <FiArrowRight className="ml-2" />}
              </motion.button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Need help? Contact administration
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentLogin;