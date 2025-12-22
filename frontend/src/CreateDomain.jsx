import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Hash, 
  BookOpen, 
  Building, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { FiGitBranch } from "react-icons/fi";

// Reusable Input Component (same as before)
const InputField = ({ 
  icon: Icon, 
  type, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative"
  >
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  </motion.div>
);

// Reusable Select Component (same as before)
const SelectField = ({ 
  icon: Icon, 
  name, 
  value, 
  onChange, 
  options, 
  placeholder, 
  required = false,
  disabled = false,
  loading = false 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative"
  >
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled || loading}
        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-500 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45 -translate-y-1/2" />
        )}
      </div>
    </div>
  </motion.div>
);

// Reusable Button Component (same as before)
const Button = ({ 
  children, 
  type = "button", 
  onClick, 
  disabled = false, 
  loading = false,
  variant = "primary" 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
        variants[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
};

const CreateDomain = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're in edit mode from location state
  const isEditMode = location.state?.editMode || false;
  const domainData = location.state?.domainData || null;
  const preSelectedDept = location.state?.department || null;

  const [domain, setDomain] = useState({
    domain_id: "",
    name: "",
    dept_id: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState({
    departments: false,
    submit: false
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  // Check if we have pre-selected department
  const hasPreSelectedDept = !!preSelectedDept;

  // Initialize form with domain data if in edit mode OR with pre-selected department
  useEffect(() => {
    if (isEditMode && domainData) {
      // Edit mode: Fill all domain data
      setDomain({
        domain_id: domainData.domain_id || "",
        name: domainData.name || "",
        dept_id: domainData.dept_id || "",
      });
    } else if (hasPreSelectedDept) {
      // Create mode with pre-selected department
      const initialDomain = { ...domain };
      
      if (preSelectedDept) {
        // Handle both object and string values for department
        const deptId = typeof preSelectedDept === 'string' 
          ? preSelectedDept 
          : preSelectedDept.dept_id || preSelectedDept.value || preSelectedDept;
        initialDomain.dept_id = deptId;
      }
      
      setDomain(initialDomain);
    }
  }, [isEditMode, domainData, preSelectedDept, hasPreSelectedDept]);

  // Fetch departments once on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(prev => ({ ...prev, departments: true }));
      try {
        const res = await axios.get("https://cbcs-project.onrender.com/api/departments");
        const departmentsData = res.data.map(dept => ({
          value: dept.dept_id,
          label: dept.dept_name
        }));
        
        // If we have pre-selected department but it's not in the fetched data, add it
        let finalDepartments = [...departmentsData];
        if (preSelectedDept && !isEditMode) {
          const deptId = typeof preSelectedDept === 'string' 
            ? preSelectedDept 
            : preSelectedDept.dept_id || preSelectedDept.value || preSelectedDept;
          const deptName = typeof preSelectedDept === 'string'
            ? "Selected Department"
            : preSelectedDept.dept_name || preSelectedDept.label || "Selected Department";
          
          const exists = departmentsData.some(dept => dept.value === deptId);
          if (!exists && deptId) {
            finalDepartments = [
              ...departmentsData,
              { value: deptId, label: deptName }
            ];
          }
        }
        
        setDepartments(finalDepartments);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setMessage({ type: "error", text: "Failed to load departments" });
      } finally {
        setLoading(prev => ({ ...prev, departments: false }));
      }
    };

    fetchDepartments();
  }, [preSelectedDept, isEditMode]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDomain(prev => ({ ...prev, [name]: value }));
    
    // Clear message when user starts typing
    if (message.text) setMessage({ type: "", text: "" });
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Submit form for both create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));

    try {
      if (isEditMode) {
        // Update existing domain
        await axios.put(`https://cbcs-project.onrender.com/api/domains/${domainData._id}`, domain);
        setMessage({ type: "success", text: "Domain updated successfully!" });
      } else {
        // Create new domain
        await axios.post("https://cbcs-project.onrender.com/api/domains", domain);
        setMessage({ type: "success", text: "Domain created successfully!" });
        
        // Reset form only for create mode
        setDomain({
          domain_id: "",
          name: "",
          dept_id: "",
        });
      }
      
      // Auto-clear success message
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      console.error("Error saving domain:", error);
      setMessage({ 
        type: "error", 
        text: isEditMode ? "Failed to update domain." : "Failed to create domain." 
      });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Get display name for pre-selected department
  const getPreSelectedDeptName = () => {
    if (!preSelectedDept) return "";
    if (typeof preSelectedDept === 'string') return preSelectedDept;
    return preSelectedDept.dept_name || preSelectedDept.label || preSelectedDept;
  };

  // Dynamic content based on mode
  const headerTitle = isEditMode ? "Edit Domain" : "Create Domain";
  const headerDescription = isEditMode 
    ? "Update domain information" 
    : "Add new specialized domain to the department";
  const buttonText = isEditMode 
    ? (loading.submit ? "Updating Domain..." : "Update Domain")
    : (loading.submit ? "Creating Domain..." : "Create Domain");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto"
      >
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 text-center relative"
        >
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="absolute left-6 top-6 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isEditMode 
              ? "bg-gradient-to-r from-orange-500 to-red-600" 
              : "bg-gradient-to-r from-purple-500 to-blue-600"
          }`}>
            <FiGitBranch className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{headerTitle}</h1>
          <p className="text-gray-600">{headerDescription}</p>
          
          
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Domain ID - Disabled in edit mode */}
            <InputField
              icon={Hash}
              type="text"
              name="domain_id"
              value={domain.domain_id}
              onChange={handleChange}
              placeholder="Domain ID (e.g., DOBC101)"
              required
              disabled={isEditMode}
            />

            {/* Domain Name */}
            <InputField
              icon={BookOpen}
              type="text"
              name="name"
              value={domain.name}
              onChange={handleChange}
              placeholder="Domain Name (e.g., Block Chain)"
              required
            />

            {/* Department Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department {hasPreSelectedDept && !isEditMode && "(Pre-selected)"}
              </label>
              <SelectField
                icon={Building}
                name="dept_id"
                value={domain.dept_id}
                onChange={handleChange}
                options={departments}
                placeholder="Select Department"
                required
                disabled={hasPreSelectedDept && !isEditMode}
                loading={loading.departments}
              />
            </div>

            {/* Message Alert */}
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 rounded-xl border ${
                    message.type === "error" 
                      ? "bg-red-50 border-red-200 text-red-700" 
                      : "bg-green-50 border-green-200 text-green-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {message.type === "error" ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">{message.text}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="submit"
                loading={loading.submit}
                disabled={loading.submit}
              >
                {buttonText}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreateDomain;