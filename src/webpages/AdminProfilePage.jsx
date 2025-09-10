import React, { useState } from "react";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";
import { RollerCoaster } from "lucide-react";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";



// CircleButton component
function CircleButton({ text, color, onClick }) {
  return (
    <button
      className={`${color} text-white px-4 py-2 rounded-full hover:opacity-80 transition`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

// ProfileCard component
function ProfileCard({ profile, setProfile }) {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfile({ ...profile, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl pt-3 pb-6 px-6 flex flex-col 
      outline outline-2 outline-[#00539F] 
      shadow-lg shadow-[#00539F]/50">
      
      <h2 className="text-blue-900 font-semibold mb-4 text-left text-base sm:text-base">
        Basic Information
      </h2>

      <div className="flex flex-col md:flex-row md:justify-start items-center md:items-center pb-4 px-4 sm:gap-8 gap-4">

        <div className="flex flex-col md:justify-center items-center pl-0">
          <input
            type="file"
            accept="image/*"
            id="profileImageInput"
            className="hidden"
            onChange={handleImageChange}
          />

          <img
            src={profile.avatar}
            alt=""
            className="w-50 h-50 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-1 border-purple-400 object-cover"
          />

          <button
            onClick={() => document.getElementById("profileImageInput").click()}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:underline text-sm sm:text-base"
          >
            Change Picture
          </button>
        </div>

        <div className="flex flex-col text-center md:text-left px-8 sm:px-8 space-y-0 pt-0">
          <p className="text-blue-700 font-bold text-2xl sm:text-2xl">{profile.name}</p>
          <p className="text-gray-600 text-sm sm:text-xs">{profile.position}</p>
          <p className="text-gray-500 text-xs sm:text-xs mb-2">{profile.location}</p>

          <div className="sm:text-sm space-y-2">
            <p>
              <span className="font-bold text-blue-600 text-sm">Employee ID:</span><br />
              <span className="text-black text-xs">{profile.employeeid}</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Email:</span><br />
              <span className="text-black text-xs">{profile.email}</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Contact Number:</span><br />
              <span className="text-black text-xs">{profile.contact_number}</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Birth Date:</span><br />
              <span className="text-black text-xs">{profile.birthDate}</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Department:</span><br />
              <span className="text-black text-xs">{profile.department}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SummaryCard component
function SummaryCard({ notes, setNotes }) {
  const history = [
    { completed_at: "2024-11-15", request_type: "Executive Premium", hospital_name: "Makati Medical Center", current_status: "Completed" },
    { completed_at: "2024-08-22", request_type: "Regular Package", hospital_name: "St. Lukes Medical Center", current_status: "Completed" },
    { completed_at: "2024-05-10", request_type: "Executive Premium", hospital_name: "The Medical City Clinic", current_status: "Completed" },
    { completed_at: "2024-02-18", request_type: "Regular Package", hospital_name: "Asian Hospital", current_status: "Completed" },
    { completed_at: "2023-11-20", request_type: "Executive Premium", hospital_name: "Makati Medical Center", current_status: "Completed" },
    { completed_at: "2023-08-14", request_type: "Special Request", hospital_name: "Cardinal Santos", current_status: "Completed" },
    { completed_at: "2023-05-05", request_type: "Regular Package", hospital_name: "St. Lukes Medical Center", current_status: "Completed" },
    { completed_at: "2023-02-12", request_type: "Executive Premium", hospital_name: "The Medical City Clinic", current_status: "Completed" },
  ];

  const paddedHistory = [
    ...history,
    ...Array.from({ length: Math.max(0, 10 - history.length) }, () => ({
      completed_at: "-",
      request_type: "-",
      hospital_name: "-",
      current_status: "-",
    })),
  ].slice(0, 10);

  const [isEditing, setIsEditing] = useState(true);

  const handleSave = () => setIsEditing(false);
  const handleCancel = () => {
    setNotes("");
    setIsEditing(true);
  };

  return (
    <div className="bg-white rounded-2xl pt-3 pb-6 px-6 flex flex-col 
      outline outline-2 outline-[#00539F] 
      shadow-lg shadow-[#00539F]/50 gap-2">

      <div className="text-left">
        <h2 className="text-blue-900 font-semibold sm:text-base">Summary</h2>
        <p className="text-xs">Your activity overview in MetroExecuCare</p>
      </div>

      <div className="bg-white shadow-md rounded-2xl pt-2 pb-6 px-6 flex flex-col 
          outline outline-1 outline-[#00539F] 
          shadow-lg shadow-[#00539F]/50 gap-2">
        <h1 className="text-xs sm:text-xs text-left">
          <span className="text-blue-900 font-semibold">Action Log:</span> Your past ten (10) requests
        </h1>
        <table className="w-full text-xs">
          <thead className="bg-purple-300 text-center p-1">
            <tr>
              <th className="p-1">Date</th>
              <th className="p-1">Package</th>
              <th className="p-1">Location</th>
              <th className="p-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {paddedHistory.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-1 text-blue-600">{item.completed_at}</td>
                <td className="p-1">{item.request_type}</td>
                <td className="p-1">{item.hospital_name}</td>
                <td className="p-1">{item.current_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white shadow-md rounded-2xl py-3 px-6 flex flex-col 
          outline outline-1 outline-[#00539F] 
          shadow-lg shadow-[#00539F]/50 text-xs">
        <h2 className="text-blue-900 text-sm font-semibold mb-2 text-left sm:text-sm">Notes: Write down notes or reminders of yourself ...</h2>
        <textarea
          className="w-full rounded-lg px-1 h-22 resize-none bg-[repeating-linear-gradient(white,white_23px,#6b7280_24px)]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          readOnly={!isEditing}
          onFocus={() => setIsEditing(true)}
        ></textarea>
        <div className="flex gap-2 mt-2">
          <CircleButton text="Save" color="bg-blue-600" onClick={handleSave} />
          <CircleButton text="Cancel" color="bg-gray-400" onClick={handleCancel} />
        </div>
      </div>
    </div>
  );
}

// PasswordChangeCard component with validation
function PasswordChangeCard() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character');
    }
    return errors;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors;
      }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Check if new password is same as current
    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success modal
      setShowModal(true);
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      setErrors({
        submit: 'Failed to update password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render password requirements
  const renderPasswordRequirements = () => {
    if (!formData.newPassword) return null;
    
    const requirements = [
      { rule: 'At least 8 characters', valid: formData.newPassword.length >= 8 },
      { rule: 'One uppercase letter', valid: /[A-Z]/.test(formData.newPassword) },
      { rule: 'One lowercase letter', valid: /[a-z]/.test(formData.newPassword) },
      { rule: 'One number', valid: /\d/.test(formData.newPassword) },
      { rule: 'One special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
    ];
    
    return (
      <div className="text-xs">
        <p className="text-gray-600 mb-2">Password requirements:</p>
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li key={index} className={`flex items-center gap-2 ${req.valid ? 'text-green-600' : 'text-red-500'}`}>
              <span className="text-xs font-bold">{req.valid ? '✓' : '×'}</span>
              <span>{req.rule}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl pt-3 px-6 pb-3 flex flex-col 
        outline outline-2 outline-[#00539F] 
        shadow-lg shadow-[#00539F]/50">
        
        <h2 className="text-blue-900 text-sm font-semibold mb-4 sm:text-sm text-left">Change Password</h2>
        <div className="space-y-2 text-xs">

          {/* Current Password */}
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              className={`h-6 w-full border rounded-lg p-2 pr-10 ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showCurrent ? (
                <img src={EyeOpen} alt="Show password" className="size-4 text-gray-500" />
              ) : (
                <img src={EyeClose} alt="Hide password" className="size-4 text-gray-500" />
              )}
            </button>
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`h-6 w-full border rounded-lg p-2 pr-10 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNew ? (
                  <img src={EyeOpen} alt="Show password" className="size-4 text-gray-500" />
              ) : (
                <img src={EyeClose} alt="Hide password" className="size-4 text-gray-500" />
              )}
            </button>
            {errors.newPassword && (
              <div className="text-red-500 text-xs mt-1">
                {Array.isArray(errors.newPassword) ? (
                  <ul className="list-disc list-inside">
                    {errors.newPassword.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{errors.newPassword}</p>
                )}
              </div>
            )}
            {renderPasswordRequirements()}
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`h-6 w-full border rounded-lg p-2 pr-10 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? (
                  <img src={EyeOpen} alt="Show password" className="size-4 text-gray-500" />
              ) : (
                <img src={EyeClose} alt="Hide password" className="size-4 text-gray-500" />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-500 text-xs mt-2">{errors.submit}</p>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-white text-xs font-medium ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Updated Successfully!</h3>
              <p className="text-sm text-gray-600">Your password has been changed successfully.</p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Main AdminProfilePage component
export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    id: 1,
    employeeid: "EMP001",
    name: "John Doe",
    position: "Admin",
    role: "Admin",
    location: "Metrobank Fort - Ecoprime Tower",
    email: "john.doe@example.com",
    contact_number: "09171234567",
    birthDate: "1995-04-15",
    department: "IT",
    avatar: "https://i.pravatar.cc/100?img=1",
  });

  const [notes, setNotes] = useState("");

  return (
    <>
      <NavBarSide />
      <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900">
        Admin Profile
      </h1>
      <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 md:pr-13 md:pl-10 sm:pr-2 sm:pl-2">
          
          <div>
            <ProfileCard profile={profile} setProfile={setProfile} />
          </div>

          <div className="lg:row-span-2">
            <SummaryCard notes={notes} setNotes={setNotes} />
          </div>

          <div>
            <PasswordChangeCard />
          </div>
        </div>
      </div>
    </>
  );
}