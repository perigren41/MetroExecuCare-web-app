import React, { useState, useEffect } from "react";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";
import apiService from "@/services/api";

export default function NewUserFormModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: "",
    employeeid: "EMP" + String(Date.now()).slice(-4), // auto-generate ID
    FirstName: "",
    MiddleName: "",
    LastName: "",
    password: "",
    position: "",
    role: "",
    branch_id: "",
    email: "",
    contact_number: "",
    department_id: "",
    birthDate: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMissingFields, setShowMissingFields] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);

  // Fetch departments and branches on component mount
  useEffect(() => {
    const fetchDepartmentsAndBranches = async () => {
      try {
        const [deptsResponse, branchesResponse] = await Promise.all([
          apiService.get("/departments", { params: { is_active: "1" } }),
          apiService.get("/branches", { params: { is_active: "1" } })
        ]);

        if (deptsResponse.success) {
          setDepartments(deptsResponse.data || []);
        }
        if (branchesResponse.success) {
          setBranches(branchesResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching departments/branches:", error);
      }
    };

    fetchDepartmentsAndBranches();
  }, []);

  // Generate Employee ID based on role
  const generateEmployeeId = (role) => {
    let prefix = "EMP"; // default

    switch (role) {
      case "admin":
        prefix = "ADM";
        break;
      case "executive":
        prefix = "EXE";
        break;
      case "hr_personnel":
        prefix = "HRP";
        break;
      case "benefits_officer":
        prefix = "BNO";
        break;
      case "welfare_head":
        prefix = "WFH";
        break;
      default:
        prefix = "EMP"; // fallback
    }

    // Generate 3-digit random number
    const randomNum = String(Math.floor(100 + Math.random() * 900));
    return prefix + randomNum;
  };

  // Pre-fill form if editing
  useEffect(() => {
    if (user) {
      // Map backend fields to form fields
      setFormData({
        id: user.id || "",
        employeeid: user.employee_id || "",
        FirstName: user.first_name || "",
        MiddleName: user.middle_name || "",
        LastName: user.last_name || "",
        password: "", // Don't pre-fill password for security
        position: user.position || "",
        role: user.role || "",
        branch_id: user.branch_id || "",
        email: user.email || "",
        contact_number: user.contact_number || "",
        department_id: user.department_id || "",
        birthDate: user.birth_date || "", // Map birth_date from backend
      });
    } else {
      // For new users, start with default Employee ID
      const defaultEmployeeId = "EMP" + String(Math.floor(100 + Math.random() * 900));
      setFormData({
        id: "",
        employeeid: defaultEmployeeId, // Auto-generate default ID
        FirstName: "",
        MiddleName: "",
        LastName: "",
        password: "",
        position: "",
        role: "",
        branch_id: "",
        email: "",
        contact_number: "",
        department_id: "",
        birthDate: "",
      });
    }
  }, [user]);

  // Handle input change - Updated to include automatic Employee ID generation
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Debug log for birthDate
    if (name === "birthDate") {
      console.log("=== BIRTHDATE CHANGE ===", value);
    }

    // If role is changing, auto-generate new Employee ID
    if (name === "role" && value) {
      const newEmployeeId = generateEmployeeId(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        employeeid: newEmployeeId
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit → show confirm modal or missing fields
  const handleSubmit = (e) => {
    e.preventDefault();

    // Middle name is now optional, removed from required fields
    const requiredFields = [
      "FirstName",
      "LastName",
      "employeeid",
      "password",
      "position",
      "role",
      "branch_id",
      "email",
      "contact_number",
      "department_id",
      "birthDate",
    ];

    const missing = requiredFields.filter((field) => {
      const value = formData[field];
      // Handle different field types
      if (field === "birthDate") {
        return !value; // Just check if birthDate exists
      }
      // For string fields, check if empty or whitespace only
      return !value || (typeof value === 'string' && value.trim() === "");
    });

    if (missing.length > 0) {
      setMissingFields(missing);
      setShowMissingFields(true); // show warning modal
      return;
    }

    // Validate age (must be 18+)
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      // Adjust age if birthday hasn't occurred this year
      const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

      if (actualAge < 18) {
        setErrorMessage("User must be at least 18 years old");
        setErrorDetails(["The birth date indicates the user is under 18 years old. Please verify the date of birth."]);
        return;
      }
    }

    setMissingFields([]);
    setShowConfirm(true); // show confirm modal
  };

  // Confirm Save - Updated to use the existing employeeid
  const confirmSave = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setErrorDetails([]);

    try {
      // Use the existing employeeid from formData (already generated when role was selected)
      const employeeId = formData.employeeid || generateEmployeeId(formData.role || "");

      console.log("=== DEBUG: formData.birthDate ===", formData.birthDate);
      console.log("=== DEBUG: formData ===", formData);

      const userData = {
        employee_id: employeeId, // Backend expects employee_id
        first_name: formData.FirstName,
        middle_name: formData.MiddleName,
        last_name: formData.LastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        position: formData.position,
        contact_number: formData.contact_number,
        branch_id: formData.branch_id ? parseInt(formData.branch_id) : null,
        birth_date: formData.birthDate,
      };

      console.log("=== DEBUG: Saving user data ===", userData);
      console.log("=== DEBUG: birth_date value ===", userData.birth_date);

      await onSave(userData);

      setShowConfirm(false);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);

      // Close confirm modal to show error
      setShowConfirm(false);

      // Handle different error types
      if (error.response) {
        // Server responded with error
        const errorData = error.response.data;

        if (errorData.details && Array.isArray(errorData.details)) {
          // Validation errors
          setErrorMessage(errorData.error || "Validation failed");
          setErrorDetails(errorData.details);
        } else if (errorData.error) {
          // Single error message
          setErrorMessage(errorData.error);
        } else {
          setErrorMessage("An error occurred while saving the user");
        }
      } else if (error.message) {
        // Network or other error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setErrorMessage("Cannot connect to server. Please check your connection.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Utility to add red border for missing fields
  const borderClass = (fieldName) =>
    missingFields.includes(fieldName) ? "border-red-500" : "border-gray-500";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-sm sm:max-w-xl h-auto relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="flex justify-between items-center
            bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]
            text-white px-3 sm:px-4 py-2 sm:py-1 rounded-t-lg"
        >
          <h2 className="text-xs sm:text-sm font-bold">New User</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-lg cursor-pointer"
          >
            ✖
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-3 sm:mx-5 mt-3 p-3 bg-red-50 border border-red-300 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">{errorMessage}</h3>
                {errorDetails.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                    {errorDetails.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => {
                  setErrorMessage("");
                  setErrorDetails([]);
                }}
                className="ml-2 text-red-600 hover:text-red-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4"
        >
          {/* Personal Information Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-blue-900 pb-2 border-b border-gray-200">Personal Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* First Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    borderClass("FirstName") === "border-red-500"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter first name"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    borderClass("LastName") === "border-red-500"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Middle Name - OPTIONAL */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                Middle Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="MiddleName"
                value={formData.MiddleName}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  borderClass("MiddleName") === "border-red-500"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter middle name"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Birth Date</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  borderClass("birthDate") === "border-red-500"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              />
            </div>
          </div>

          {/* Account Information Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-blue-900 pb-2 border-b border-gray-200">Account Information</h3>

            {/* Employee ID */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Employee ID</label>
              <input
                type="text"
                name="employeeid"
                value={formData.employeeid}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  borderClass("employeeid") === "border-red-500"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Auto-generated"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Password {!user && <span className="text-red-500">*</span>}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    borderClass("password") === "border-red-500"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder={user ? "Leave blank to keep current password" : "Enter password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity"
                >
                  {showPassword ? (
                    <img src={EyeOpen} alt="Hide password" className="w-4 h-4" />
                  ) : (
                    <img src={EyeClose} alt="Show password" className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Employment Information Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-blue-900 pb-2 border-b border-gray-200">Employment Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Role */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    borderClass("role") === "border-red-500"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="" disabled>Select role</option>
                  <option value="admin">Admin</option>
                  <option value="hr_personnel">Human Resource Personnel</option>
                  <option value="benefits_officer">Benefits Officer</option>
                  <option value="welfare_head">Division Head</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              {/* Position */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Position <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    borderClass("position") === "border-red-500"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter position"
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Department</label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  borderClass("department_id") === "border-red-500"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Branch</label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  borderClass("branch_id") === "border-red-500"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-blue-900 pb-2 border-b border-gray-200">Contact Information</h3>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  borderClass("email") === "border-red-500"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="user@metrobank.com"
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 20);
                  setFormData((prev) => ({ ...prev, contact_number: value }));
                }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  borderClass("contact_number") === "border-red-500"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="09123456789"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : (user ? "Update User" : "Create User")}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full sm:w-60 mx-2 sm:mx-4 max-w-sm">
            <h2 className="text-sm font-bold text-blue-900 mb-3">
              Add this user?
            </h2>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmSave}
                disabled={isLoading}
                className="px-4 py-1 rounded-full bg-blue-700 text-white text-xs hover:bg-blue-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Yes"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="px-4 py-1 rounded-full bg-gray-400 text-white text-xs hover:bg-gray-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Missing Fields Modal */}
      {showMissingFields && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center w-full sm:w-80 mx-2 sm:mx-4 max-w-sm">
            <h2 className="text-sm font-bold text-red-600 mb-3">
              Fill all the missing fields
            </h2>
            <button
              onClick={() => setShowMissingFields(false)}
              className="px-4 py-1 rounded-full bg-blue-700 text-white text-xs hover:bg-blue-800 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}