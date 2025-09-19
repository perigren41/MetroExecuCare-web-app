import React, { useState, useEffect } from "react";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";
import ProfileGray from "@/assets/profilegray.svg";

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
    branch: "",
    email: "",
    contact_number: "",
    department: "",
    birthDate: "",
    profileImage: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMissingFields, setShowMissingFields] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  // Generate Employee ID based on role
  const generateEmployeeId = (role) => {
    let prefix = "EMP"; // default
    
    switch (role) {
      case "Admin":
        prefix = "ADM";
        break;
      case "Executive Employee":
        prefix = "EO";
        break;
      case "Benefits Assistant":
        prefix = "BA";
        break;
      case "Benefits Services Officer":
        prefix = "BSO";
        break;
      case "Division Head":
        prefix = "DH";
        break;
      default:
        prefix = "EMP"; // fallback
    }
    
    // Generate 3-digit random number
    const randomNum = String(Math.floor(100 + Math.random() * 900));
    return prefix;
  };

  // Pre-fill form if editing
  useEffect(() => {
    if (user) {
      setFormData(user);
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
        branch: "",
        email: "",
        contact_number: "",
        department: "",
        birthDate: "",
        profileImage: "",
      });
    }
  }, [user]);

  // Handle input change - Updated to include automatic Employee ID generation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
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

    const requiredFields = [
      "FirstName",
      "MiddleName",
      "LastName",
      "employeeid",
      "password",
      "position",
      "role",
      "branch",
      "email",
      "contact_number",
      "department",
      "birthDate",
    ];

    const missing = requiredFields.filter(
      (field) => !formData[field] || formData[field].trim() === ""
    );

    if (missing.length > 0) {
      setMissingFields(missing);
      setShowMissingFields(true); // show warning modal
    } else {
      setMissingFields([]);
      setShowConfirm(true); // show confirm modal
    }
  };

  // Confirm Save - Updated to use the existing employeeid
  const confirmSave = () => {
    // Use the existing employeeid from formData (already generated when role was selected)
    const employeeId = formData.employeeid || generateEmployeeId(formData.role || "");
    
    // Generate numeric internal ID (sequential or fallback)
    const nextId =
      typeof confirmSave.lastId === "number"
        ? confirmSave.lastId + 1
        : 1; // start at 1 if none yet
    confirmSave.lastId = nextId; // store for next save

    const userData = {
      id: nextId, // Internal numeric ID
      employeeid: employeeId, // Use the generated/existing Employee ID
      name: `${formData.FirstName || ""} ${formData.MiddleName || ""} ${
        formData.LastName || ""
      }`.trim(),
      profileImage: formData.profileImage || "https://i.pravatar.cc/100",
      position: formData.position,
      role: formData.role,
      email: formData.email,
      contact: formData.contact_number,
      contact_number: formData.contact_number,
      department: formData.department,
      branch: formData.branch,
      birthDate: formData.birthDate,
      created_at: new Date().toISOString().split("T")[0],
    };

    console.log("Saving user data:", userData);
    onSave(userData);
    setShowConfirm(false);
    onClose();
  };

  // Utility to add red border for missing fields
  const borderClass = (fieldName) =>
    missingFields.includes(fieldName) ? "border-red-500" : "border-gray-500";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-xl h-auto relative overflow-hidden mx-4 my-8 sm:mx-6 sm:my-10 md:mx-0 md:my-0">
        {/* Header */}
        <div
          className="flex justify-between items-center 
            bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
            text-white px-4 py-1 rounded-t-lg"
        >
          <h2 className="text-sm font-bold">New User</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-lg"
          >
            ✖
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-[7fr_14fr_auto] grid-rows-[auto] gap-1 p-5 text-xs items-start text-left"
        >
          {/* First Name */}
          <label className="font-medium text-blue-900">First Name</label>
          <input
            type="text"
            name="FirstName"
            value={formData.FirstName}
            onChange={handleChange}
            required
            className={`border rounded-sm gap-1 py-0 text-xs w-full px-1 ${borderClass(
              "FirstName"
            )}`}
          />

          {/* Profile upload - IMPROVED: Better styling and error handling */}
          <div className="row-span-11 flex flex-col items-center gap-2 mt-6 ml-4">
            <div className="w-40 h-40 rounded-full border flex items-center justify-center bg-white overflow-hidden">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-40 h-40 object-cover"
                />
              ) : (
                <img
                  src={ProfileGray}
                  alt="Default Profile"
                  className="w-10 h-10 text-gray-400"
                />
              )}
            </div>

            <label
              htmlFor="profileImage"
              className="text-xs text-blue-600 cursor-pointer hover:underline"
            >
              {formData.profileImage ? "Change Image" : "Add Image"}
            </label>

            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Check file size (optional: limit to 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    alert("File size should be less than 5MB");
                    return;
                  }
                  
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({ 
                      ...prev, 
                      profileImage: reader.result 
                    }));
                  };
                  reader.onerror = () => {
                    alert("Error reading file. Please try again.");
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
          </div>

          {/* Middle Name */}
          <label className="font-medium text-blue-900">Middle Name</label>
          <input
            type="text"
            name="MiddleName"
            value={formData.MiddleName}
            onChange={handleChange}
            required
            className={`border rounded-sm gap-1 py-0 text-xs w-full px-1 ${borderClass(
              "MiddleName"
            )}`}
          />

          {/* Last Name */}
          <label className="font-medium text-blue-900">Last Name</label>
          <input
            type="text"
            name="LastName"
            value={formData.LastName}
            onChange={handleChange}
            required
            className={`border rounded-sm gap-1 py-0 text-xs w-full px-1 ${borderClass(
              "LastName"
            )}`}
          />

          {/* Employee ID - Updated with generate button */}
          <label className="font-medium text-blue-900">Employee ID</label>
          <div className="flex gap-1 items-center">
            <input
              type="text"
              name="employeeid"
              value={formData.employeeid}
              onChange={handleChange}
              className={`border rounded-sm gap-1 py-0 text-xs flex-1 px-1 ${borderClass(
                "employeeid"
              )}`}
            />
            
          </div>

          {/* Password */}
          <label className="font-medium text-blue-900">Password</label>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`border rounded-sm gap-1 py-0 text-xs w-full pr-8 px-1 ${borderClass(
                "password"
              )}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <img src={EyeOpen} alt="Hide password" className="size-4" />
              ) : (
                <img src={EyeClose} alt="Show password" className="size-4" />
              )}
            </button>
          </div>

          {/* Role */}
          <label className="font-medium text-blue-900">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`border rounded-sm gap-1 py-0 text-xs w-full shadow-lg px-1 ${borderClass(
              "role"
            )}`}
          >
            <option value="" disabled>
              Select role
            </option>
            <option value="Admin">Admin</option>
            <option value="Senior Executive Officer">
              Senior Executive Officer
            </option>
            <option value="Benefits Assistant">Benefits Assistant</option>
            <option value="Benefits Services Officer">
              Benefits Services Officer
            </option>
            <option value="Division Head">Division Head</option>
          </select>

          {/* Position */}
          <label className="font-medium text-blue-900">Position</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            className={`border rounded-sm gap-1 py-0 text-xs w-full px-1 ${borderClass(
              "position"
            )}`}
          />

          {/* Branch */}
          <label className="font-medium text-blue-900">Branch</label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className={`border rounded-sm gap-1 py-0 text-xs w-full shadow-lg px-1 ${borderClass(
              "branch"
            )}`}
          >
            <option value="" disabled>
              Select branch
            </option>
            <option value="Metrobank Fort - Mckinley Branch">Metrobank Fort - Mckinley Branch</option>
            <option value="Metrobank Fort - Ecoprime Tower">Metrobank Fort - Ecoprime Tower</option>
            <option value="Metrobank Taguig - Puregold Branch">Metrobank Taguig - Puregold Branch</option>
            <option value="Metrobank Taguig - Vista Mall">Metrobank Fort-Ten West Campus Branch</option>
            <option value="Metrobank Fort - Bayani Road Branch">Metrobank Fort - Bayani Road Branch</option>
          </select>

          {/* Email */}
          <label className="font-medium text-blue-900">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`border rounded-sm gap-1 py-0 text-xs w-full px-1 ${borderClass(
              "email"
            )}`}
          />

          {/* Contact */}
          <label className="font-medium text-blue-900">Contact Number</label>
          <input
            type="text"
            name="contact_number"
            value={formData.contact_number}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 20);
              setFormData((prev) => ({ ...prev, contact_number: value }));
            }}
            className={`border rounded-sm gap-1 py-0 text-xs w-full px-1 ${borderClass(
              "contact_number"
            )}`}
          />

          {/* Department */}
          <label className="font-medium text-blue-900">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`border rounded-sm gap-1 py-0 text-xs w-full px-1 ${borderClass(
              "department"
            )}`}
          />

          {/* Birth Date */}
          <label className="font-medium text-blue-900">Birth Date</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className={`border rounded-sm gap-1 py-0 text-xs w-full px-1 ${borderClass(
              "birthDate"
            )}`}
          />

          {/* Actions */}
          <div className="col-span-3 flex justify-end gap-2 mt-0">
            <button
              type="submit"
              className="px-4 py-1 w-15 h-6 rounded-full bg-blue-700 text-white text-xs hover:bg-blue-800"
            >
              {user ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 w-15 h-6 rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-60">
            <h2 className="text-sm font-bold text-blue-900 mb-3">
              Add this user?
            </h2>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmSave}
                className="px-4 py-1 rounded-full bg-blue-700 text-white text-xs hover:bg-blue-800"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 rounded-full bg-gray-400 text-white text-xs hover:bg-gray-500"
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
          <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
            <h2 className="text-sm font-bold text-red-600 mb-3">
              Fill all the missing fields
            </h2>
            <button
              onClick={() => setShowMissingFields(false)}
              className="px-4 py-1 rounded-full bg-blue-700 text-white text-xs hover:bg-blue-800"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}