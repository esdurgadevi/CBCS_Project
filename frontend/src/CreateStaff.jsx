import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Globe, 
  Upload, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { FiUserPlus } from "react-icons/fi";

// Reusable Input Component
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

// Reusable Select Component
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

// Reusable File Upload Component
const FileUpload = ({ onChange, file, currentImage }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative"
  >
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 group">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, JPEG (Max. 5MB)</p>
      </div>
      <input
        type="file"
        className="hidden"
        onChange={onChange}
        accept="image/*"
      />
    </label>
    
    <AnimatePresence>
      {file && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full border shadow-sm flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
            {file.name}
          </span>
        </motion.div>
      )}
    </AnimatePresence>

    {currentImage && !file && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 text-center"
      >
        <p className="text-sm text-gray-600 mb-2">Current Image:</p>
        <img 
          src={`http://localhost:5000/${currentImage}`} 
          alt="Current staff" 
          className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-gray-300"
        />
      </motion.div>
    )}
  </motion.div>
);

// Reusable Button Component
const Button = ({ 
  children, 
  type = "button", 
  onClick, 
  disabled = false, 
  loading = false,
  variant = "primary" 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25",
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

const CreateStaff = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isEditMode = location.state?.editMode || false;
  const staffData = location.state?.staffData || null;
  const preSelectedDept = location.state?.department || null;
  const preSelectedDomain = location.state?.domain || null;

  const [staff, setStaff] = useState({
    staff_id: "",
    name: "",
    email: "",
    phone: "",
    dept_id: "",
    domain_id: "",
  });

  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [departments, setDepartments] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState({
    departments: false,
    domains: false,
    submit: false
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const hasPreSelectedValues = preSelectedDept || preSelectedDomain;

  useEffect(() => {
    if (isEditMode && staffData) {
      setStaff({
        staff_id: staffData.staff_id || "",
        name: staffData.name || "",
        email: staffData.email || "",
        phone: staffData.phone || "",
        dept_id: staffData.dept_id || "",
        domain_id: staffData.domain_id || "",
      });
      if (staffData.image) setCurrentImage(staffData.image);
    } else if (hasPreSelectedValues) {
      const initialStaff = { ...staff };
      if (preSelectedDept) {
        initialStaff.dept_id = typeof preSelectedDept === "string" 
          ? preSelectedDept 
          : preSelectedDept.dept_id || preSelectedDept.value || preSelectedDept;
      }
      if (preSelectedDomain) {
        initialStaff.domain_id = typeof preSelectedDomain === "string" 
          ? preSelectedDomain 
          : preSelectedDomain.domain_id || preSelectedDomain.value || preSelectedDomain;
      }
      setStaff(initialStaff);
    }
  }, [isEditMode, staffData, preSelectedDept, preSelectedDomain, hasPreSelectedValues]);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(prev => ({ ...prev, departments: true }));
      try {
        const res = await axios.get("http://localhost:5000/api/departments");
        setDepartments(res.data.map(d => ({ value: d.dept_id, label: d.dept_name })));
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load departments" });
      } finally {
        setLoading(prev => ({ ...prev, departments: false }));
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchDomains = async () => {
      if (staff.dept_id) {
        setLoading(prev => ({ ...prev, domains: true }));
        try {
          const res = await axios.get(`http://localhost:5000/api/domains/dept/${staff.dept_id}`);
          setDomains(res.data.map(d => ({ value: d.domain_id, label: d.name })));
        } catch (err) {
          setMessage({ type: "error", text: "Failed to load domains" });
        } finally {
          setLoading(prev => ({ ...prev, domains: false }));
        }
      } else {
        setDomains([]);
      }
    };
    fetchDomains();
  }, [staff.dept_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) setImage(file);
    else setMessage({ type: "error", text: "File must be under 5MB" });
  };

  const handleBack = () => navigate(-1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    const formData = new FormData();
    Object.entries(staff).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append("image", image);

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/staffs/${staffData.staff_id}`, formData);
        setMessage({ type: "success", text: "Staff updated!" });
      } else {
        await axios.post("http://localhost:5000/api/staffs", formData);
        setMessage({ type: "success", text: "Staff created!" });
        setStaff({ staff_id: "", name: "", email: "", phone: "", dept_id: "", domain_id: "" });
        setImage(null);
      }
    } catch {
      setMessage({ type: "error", text: isEditMode ? "Update failed" : "Create failed" });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 text-center relative">
          <button onClick={handleBack} className="absolute left-6 top-6 p-2 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600">
            <FiUserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{isEditMode ? "Edit Staff" : "Create Staff"}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField icon={User} type="text" name="staff_id" value={staff.staff_id} onChange={handleChange} placeholder="Staff ID" required disabled={isEditMode} />
            <InputField icon={User} type="text" name="name" value={staff.name} onChange={handleChange} placeholder="Full Name" required />
            <InputField icon={Mail} type="email" name="email" value={staff.email} onChange={handleChange} placeholder="Email" required />
            <InputField icon={Phone} type="text" name="phone" value={staff.phone} onChange={handleChange} placeholder="Phone" required />

            <SelectField icon={Building} name="dept_id" value={staff.dept_id} onChange={handleChange} options={departments} placeholder="Select Department" required disabled={!!preSelectedDept && !isEditMode} loading={loading.departments} />

            <SelectField icon={Globe} name="domain_id" value={staff.domain_id} onChange={handleChange} options={domains} placeholder="Select Domain" required disabled={!!preSelectedDomain && !isEditMode} loading={loading.domains} />

            <FileUpload onChange={handleFileChange} file={image} currentImage={currentImage} />

            <AnimatePresence>
              {message.text && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`p-3 rounded-xl ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={loading.submit}>{isEditMode ? "Update Staff" : "Create Staff"}</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateStaff;
