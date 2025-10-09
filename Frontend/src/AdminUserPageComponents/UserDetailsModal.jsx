import React, { useState, useEffect } from "react";
import cameraIcon from "@/assets/cameraiconwhite.svg";
import NoProfilePicture from "@/assets/profilegray.svg";

// Function to convert role variable names to user-friendly names
const getRoleDisplayName = (role) => {
  const roleMap = {
    'admin': 'Admin',
    'hr_personnel': 'Human Resource Personnel',
    'benefits_officer': 'Benefits Officer',
    'welfare_head': 'Division Head',
    'executive': 'Executive'
  };

  return roleMap[role] || role; // Return original if not found in map
};

// Function to format date as "Month Day, Year" (e.g., "October 1, 2000")
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function UserDetailsModal({ user, onClose, onDelete, onUpdate, onRestore }) {
  if (!user) return null;

  console.log("=== UserDetailsModal user data ===", user);
  console.log("=== user.birth_date ===", user.birth_date);

  const isDeleted = user.is_active === 0;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [restorationReason, setRestorationReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Custom close function that prevents closing when success alerts are shown
  const handleModalClose = () => {
    if (showDeleteSuccessAlert || showSuccessAlert) {
      // Don't close if any success alert is showing
      return;
    }
    onClose();
  };

  // Update formData whenever a new user is selected or user data changes
  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setFormData((prev) => ({ ...prev, profile_picture_url: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // Save confirmation
  const handleSave = () => {
    setShowConfirmSave(true);
  };
  const confirmSave = async () => {
    // Validate password if provided
    if (newPassword && newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      // Call the update function and wait for it
      const updatedUserData = { ...formData };

      // Add password to update data if provided
      if (newPassword.trim()) {
        updatedUserData.password = newPassword;
      }

      const result = await onUpdate(updatedUserData);

      // Close confirmation modal immediately
      setIsEditing(false);
      setShowConfirmSave(false);
      setNewPassword(""); // Clear password field

      // Show success alert immediately
      setShowSuccessAlert(true);

      // Update formData with the latest data returned from the API
      if (result && result.data) {
        setFormData({ ...result.data });
      }

      // Call the parent's onUpdate function to refresh the user list
      // The success alert will be handled by user clicking "OK"
    } catch (error) {
      console.error('Error updating user:', error);
      // Handle error if needed
    }
  };

  // Cancel editing function
  const handleCancel = () => {
    setFormData({ ...user }); // Reset form data to original
    setIsEditing(false);
    setNewPassword(""); // Clear password field
  };
  

  // Delete confirmation
  const handleDelete = () => {
    setShowConfirmDelete(true);
  };
  const confirmDelete = () => {
    // Store the deletion reason before clearing it
    const currentDeletionReason = deletionReason;

    // Close delete confirmation modal immediately
    setShowConfirmDelete(false);
    setDeletionReason("");

    // Show delete success alert immediately
    setShowDeleteSuccessAlert(true);

    // Call the onDelete function immediately now that the parent won't close the modal
    onDelete(user.id, currentDeletionReason);
  };

  // Handle restore
  const handleRestore = () => {
    setShowConfirmRestore(true);
  };

  const confirmRestore = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5019/api/users/${user.id}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restored_reason: restorationReason
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (onRestore) {
          onRestore(user.id);
        }
        setShowConfirmRestore(false);
        setRestorationReason("");
        // Close the modal after successful restore
        handleModalClose();
      } else {
        console.error('Failed to restore user');
      }
    } catch (error) {
      console.error('Error restoring user:', error);
    }
  };

  const newLocal = <span>{formData.id}</span>;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-sm sm:max-w-4xl mx-auto relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white px-3 sm:px-4 py-2 sm:py-1 rounded-t-lg">
          <h2 className="text-xs sm:text-sm font-bold">Employee Details</h2>
          <button
            onClick={handleModalClose}
            className="text-white hover:text-gray-200 text-lg"
          >
            ✖
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-2 sm:gap-4 p-3 sm:p-5 text-left">
          {/* Archive Status Banner */}
          {isDeleted && (
            <div className="lg:col-span-2 mb-2 sm:mb-4 p-2 sm:p-4 bg-red-50 border border-red-200 rounded-lg cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-600 font-bold text-sm">🗄️ ACCOUNT ARCHIVED</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs text-red-700">
                <div>
                  <span className="font-bold">Reason:</span>
                  <br />
                  <span>{user.deletion_reason || 'No reason provided'}</span>
                </div>
                <div>
                  <span className="font-bold">Date Archived:</span>
                  <br />
                  <span>{user.deleted_at ? new Date(user.deleted_at).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div>
                  <span className="font-bold">Archived By:</span>
                  <br />
                  <span>
                    {user.deleted_by_first_name && user.deleted_by_last_name
                      ? `${user.deleted_by_first_name} ${user.deleted_by_last_name}`
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Left Column → Avatar */}
          <div className="flex justify-center items-center lg:row-span-2">
            <div className="relative w-20 h-35 sm:w-30 sm:h-30 flex items-center justify-center">
              <img
                src={formData.profile_picture_url || NoProfilePicture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-[#00539F] p-1"
              />

              <input
                type="file"
                accept="image/*"
                id="profileImageInput"
                className="hidden"
                onChange={handleImageChange}
              />

              {isEditing && !isDeleted && (
                <button
                  onClick={() =>
                    document.getElementById("profileImageInput").click()
                  }
                  className="absolute top-0 left-0 w-20 h-20 sm:w-30 sm:h-30 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50"
                >
                  <img src={cameraIcon} alt="Camera Icon" className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column → Top Info */}
          <div className="text-xs text-blue-900">
            <div className="font-bold text-sm sm:text-base">
              {isEditing && !isDeleted ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="border px-1 text-xs rounded-sm"
                  />
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name || ""}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    className="border px-1 text-xs rounded-sm"
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ""}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="border px-1 text-xs rounded-sm"
                  />
                </div>
              ) : (
                `${formData.first_name || ""} ${formData.middle_name || ""} ${formData.last_name || ""}`.trim()
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-x-1 sm:gap-x-2 gap-y-1 text-xs text-blue-900">

            <span className="font-bold">Employee ID:</span>
            <span className="text-red-600">{formData.employee_id || "N/A"}</span>

            <span className="font-bold">Role:</span>
            {isEditing && !isDeleted ? (
              <select
                name="role"
                value={formData.role || ""}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="hr_personnel">Human Resource Personnel</option>
                <option value="benefits_officer">Benefits Officer</option>
                <option value="welfare_head">Division Head</option>
                <option value="executive">Executive</option>
              </select>
            ) : (
              <span className="text-red-600">{getRoleDisplayName(formData.role) || "N/A"}</span>
            )}

            <span className="font-bold">Position:</span>
            {isEditing && !isDeleted ? (
              <input
                type="text"
                name="position"
                value={formData.position || ""}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              />
            ) : (
              <span>{formData.position || "N/A"}</span>
            )}

            <span className="font-bold">Department:</span>
            {isEditing && !isDeleted ? (
              <input
                type="text"
                name="department"
                value={formData.department || ""}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              />
            ) : (
              <span>{formData.department || "N/A"}</span>
            )}

            <span className="font-bold">Branch:</span>
            {isEditing && !isDeleted ? (
              <select
                name="branch"
                value={formData.branch || ""}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              >
                <option value="">Select Branch</option>
                <option value="Metrobank Fort - Mckinley Branch">
                  Metrobank Fort - Mckinley Branch
                </option>
                <option value="Metrobank Fort - Ecoprime Tower">
                  Metrobank Fort - Ecoprime Tower
                </option>
                <option value="Metrobank Taguig - Puregold Branch">
                  Metrobank Taguig - Puregold Branch
                </option>
                <option value="Metrobank Fort-Ten West Campus Branch">
                  Metrobank Fort-Ten West Campus Branch
                </option>
                <option value="Metrobank Fort - Bayani Road Branch">
                  Metrobank Fort - Bayani Road Branch
                </option>
              </select>
            ) : (
              <span>{formData.branch || "N/A"}</span>
            )}

            <span className="font-bold">Date Added:</span>
            <span>{formData.created_at ? new Date(formData.created_at).toLocaleDateString() : "N/A"}</span>
          </div>

          {/* Right Column → Bottom Info */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-x-1 sm:gap-x-2 gap-y-1 text-blue-900 text-xs mt-2 sm:mt-3 lg:pl-5">
            {[
              { label: "Email Address", key: "email" },
              { label: "Contact Number", key: "contact_number" },
              { label: "Birth Date", key: "birth_date", type: "date" },
            ].map(({ label, key, type }) => (
              <React.Fragment key={key}>
                <span className="font-bold">{label}:</span>
                {isEditing && !isDeleted ? (
                  <input
                    type={type || "text"}
                    name={key}
                    value={formData[key] || ""}
                    onChange={handleChange}
                    className="border px-1 text-xs w-full rounded-sm"
                  />
                ) : (
                  <span>
                    {key === "birth_date" ? formatDate(formData[key]) : (formData[key] || "N/A")}
                  </span>
                )}
              </React.Fragment>
            ))}

            {/* Password Change Field - Admin Only */}
            {isEditing && !isDeleted && (
              <>
                <span className="font-bold">New Password:</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (leave blank to keep current)"
                    className="border px-1 text-xs w-full rounded-sm pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                  </button>
                </div>
                <span className="text-xs text-gray-500 col-span-2">
                  Leave blank to keep current password. New password must be at least 8 characters.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-0 mb-2 sm:mb-4 mx-2 sm:mx-4">
          {isDeleted ? (
            <>
              <button
                onClick={handleRestore}
                className="px-3 sm:px-4 py-1 w-full sm:w-20 h-6 rounded-full bg-green-600 text-white text-xs hover:bg-green-700 cursor-pointer"
              >
                Restore Account
              </button>
            </>
          ) : isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-3 sm:px-4 py-1 w-full sm:w-15 h-6 rounded-full bg-green-600 text-white text-xs hover:bg-green-700 cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-2 sm:px-2 py-1 w-full sm:w-15 h-6 rounded-full bg-gray-600 text-white text-xs hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 sm:px-4 py-1 w-full sm:w-15 h-6 rounded-full bg-blue-700 text-white text-xs hover:bg-blue-800 cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-2 sm:px-2 py-1 w-full sm:w-15 h-6 rounded-full bg-red-600 text-white text-xs hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Save Confirm Modal */}
      {showConfirmSave && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full sm:w-60 mx-2 sm:mx-4 max-w-sm">
            <h2 className="text-sm font-bold text-blue-900 mb-3">
              Save this changes?
            </h2>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmSave}
                className="px-4 py-1 rounded-full bg-green-600 text-white text-xs hover:bg-green-700 cursor-pointer"
              >
                Yes, Save it
              </button>
              <button
                onClick={() => setShowConfirmSave(false)}
                className="px-4 py-1 rounded-full bg-gray-400 text-white text-xs hover:bg-gray-500 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full sm:w-96 mx-2 sm:mx-4 max-w-md">
            <h2 className="text-sm font-bold text-red-700 mb-3">
              Are you sure you want to delete this User?
            </h2>
            <div className="mb-4 text-left">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Reason for deletion (optional):
              </label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Enter reason for deleting this user account..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmDelete}
                className="px-4 py-1 rounded-full bg-red-600 text-white text-xs hover:bg-red-700 cursor-pointer"
              >
                Yes, Delete it
              </button>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setDeletionReason("");
                }}
                className="px-4 py-1 rounded-full bg-gray-400 text-white text-xs hover:bg-gray-500 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirm Modal */}
      {showConfirmRestore && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full sm:w-96 mx-2 sm:mx-4 max-w-md">
            <h2 className="text-sm font-bold text-green-700 mb-3">
              Restore User Account?
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to restore{' '}
              <strong>
                {`${formData.first_name} ${formData.last_name}`}
              </strong>
              's account? This will reactivate their access to the system.
            </p>
            <div className="mb-4 text-left">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Reason for restoration (optional):
              </label>
              <textarea
                value={restorationReason}
                onChange={(e) => setRestorationReason(e.target.value)}
                placeholder="Enter reason for restoring this user account..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="3"
              />
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmRestore}
                className="px-4 py-2 rounded-full bg-green-600 text-white text-xs hover:bg-green-700 cursor-pointer"
              >
                Yes, Restore Account
              </button>
              <button
                onClick={() => {
                  setShowConfirmRestore(false);
                  setRestorationReason("");
                }}
                className="px-4 py-2 rounded-full bg-gray-400 text-white text-xs hover:bg-gray-500 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert Modal */}
      {showSuccessAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full sm:w-80 mx-2 sm:mx-4 max-w-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center cursor-pointer">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-sm font-bold text-green-700 mb-2">
              Success!
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              User details have been successfully updated.
            </p>
            <button
              onClick={() => {
                setShowSuccessAlert(false);
                onClose();
              }}
              className="px-4 py-2 rounded-full bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white text-xs hover:opacity-90 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Delete Success Alert Modal */}
      {showDeleteSuccessAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl text-center w-full sm:w-96 mx-2 sm:mx-4 max-w-md border-2 border-red-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-bounce cursor-pointer">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-bold text-red-700 mb-3">
              🗑️ User Deleted Successfully!
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 cursor-pointer">
              <p className="text-sm text-gray-700 mb-2">
                <strong className="text-red-800">{`${formData.first_name} ${formData.last_name}`}</strong> has been successfully deleted and archived.
              </p>
              <p className="text-xs text-red-600">
                Their account has been deactivated and moved to the deleted users archive.
              </p>
            </div>
            <div className="text-xs text-gray-500 mb-4 italic">
              Click "OK, Continue" to return to the user management page.
            </div>
            <button
              onClick={() => {
                setShowDeleteSuccessAlert(false);
                onClose();
              }}
              className="px-6 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition transform hover:scale-105 cursor-pointer"
            >
              OK, Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}