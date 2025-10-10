import React, { useState, useEffect } from "react";
import NavBarMain from "@/Components/NavBarMain";
import { X } from "lucide-react";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";
import ProfileGray from "@/assets/profilegray.svg";
import CameraIcon from "@/assets/camera-svgrepo.svg";
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/mainLogo-foreground.svg";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";
import AlertModal from "@/Components/AlertModal";

/* ---------------- GradientCard wrapper ---------------- */
function GradientCard({ children, className, style, isMainCard = false }) {
    const roundedClass = className?.match(/rounded-\[?[\w-]+\]?/)?.[0];

    let outerRounded, innerRadius, borderWidth, innerPadding;

    // Responsive border width and padding
    if (roundedClass === "rounded-[64px]") {
        outerRounded = "rounded-[32px] lg:rounded-[64px]";
        innerRadius = "rounded-[calc(32px-2px)] sm:rounded-[calc(32px-3px)] lg:rounded-[calc(64px-3px)]";
        borderWidth = "p-[2px] sm:p-[3px] lg:p-[3px]";
    } else if (roundedClass === "rounded-[32px]") {
        outerRounded = "rounded-[16px] sm:rounded-[24px] lg:rounded-[32px]";
        innerRadius = "rounded-[calc(16px-2px)] sm:rounded-[calc(24px-3px)] lg:rounded-[calc(32px-3px)]";
        borderWidth = "p-[2px] sm:p-[3px] lg:p-[3px]";
    } else if (roundedClass?.includes("rounded-[24px]")) {
        outerRounded = "rounded-[12px] sm:rounded-[18px] lg:rounded-[24px]";
        innerRadius = "rounded-[calc(12px-2px)] sm:rounded-[calc(18px-3px)] lg:rounded-[calc(24px-3px)]";
        borderWidth = "p-[2px] sm:p-[3px] lg:p-[3px]";
    } else {
        outerRounded = "rounded-xl sm:rounded-2xl lg:rounded-3xl";
        innerRadius = "rounded-[calc(0.75rem-2px)] sm:rounded-[calc(1rem-3px)] lg:rounded-[calc(1.5rem-3px)]";
        borderWidth = "p-[2px] sm:p-[3px] lg:p-[3px]";
    }

    // Responsive inner padding
    if (isMainCard) {
        innerPadding = "px-4 py-4 sm:px-6 sm:py-5 lg:px-[93px] lg:py-8";
    } else {
        innerPadding = "p-3 sm:p-4 lg:p-4";
    }

    const cleanClassName =
        className?.replace(/rounded-\[?[\w-]+\]?/g, "").replace(/p-\d+/g, "").trim() || "";

    return (
        <div
            className={`${outerRounded} ${borderWidth} shadow-sm ${cleanClassName}`}
            style={{
                background:
                    "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                ...style,
            }}
        >
            <div
                className={`bg-white ${innerRadius} h-full w-full ${innerPadding}`}
            >
                {children}
            </div>
        </div>
    );
}

// CircleButton component
function CircleButton({ text, color, onClick }) {
  return (
    <button
      className={`${color} text-white px-4 py-2 rounded-full hover:opacity-80 transition cursor-pointer`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

// ProfileCard component
function ProfileCard({ profile, setProfile }) {
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);

  // Helper function to convert profile picture path to full URL
  const getProfilePictureUrl = (picturePath) => {
    if (!picturePath) return ProfileGray;
    if (picturePath.startsWith('http')) return picturePath;
    if (picturePath.startsWith('data:')) return picturePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
    return `${baseUrl}${picturePath}`;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      try {
        setUploading(true);

        // Upload to server
        const response = await apiService.uploadProfilePicture(profile.id, file);

        if (response.success) {
          // Update profile with new picture path
          setProfile(prev => ({
            ...prev,
            profile_picture: response.data.profile_picture,
            avatar: `${apiService.baseURL.replace('/api', '')}${response.data.profile_picture}`
          }));
          setSuccessMessage('Profile picture updated successfully!');
          setShowSuccessModal(true);
        } else {
          alert('Failed to upload profile picture: ' + response.message);
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Error uploading profile picture: ' + error.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      setIsRemoving(true);
      const response = await apiService.removeProfilePicture(profile.id);

      if (response.success) {
        setProfile(prev => ({
          ...prev,
          profile_picture: null,
          avatar: null
        }));
        setSuccessMessage('Profile picture removed successfully!');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <GradientCard className="rounded-[64px]" isMainCard={true}>
      <h2 className="text-blue-900 font-semibold mb-4 text-left text-base sm:text-base">
        Basic Information
      </h2>

      <div className="flex flex-col lg:flex-row lg:justify-start items-center lg:items-start pb-4 gap-3 sm:gap-4 lg:gap-6">

        <div className="flex flex-col items-center flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            id="profileImageInput"
            className="hidden"
            onChange={handleImageChange}
          />

          <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
            <img
              src={getProfilePictureUrl(profile.profile_picture)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => document.getElementById("profileImageInput").click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 text-blue-600 hover:underline text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <img src={CameraIcon} alt="camera" className="w-4 h-4 sm:w-5 sm:h-5" />
              {uploading ? 'Uploading...' : 'Change Picture'}
            </button>

            {profile.profile_picture && (
              <button
                onClick={handleRemoveProfilePicture}
                disabled={isRemoving}
                className="flex items-center justify-center gap-2 text-red-600 hover:underline text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                {isRemoving ? 'Removing...' : 'Remove Picture'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col text-center lg:text-left flex-grow space-y-3">
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
        {/* Success Alert Modal */}
        <AlertModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            // Auto-refresh to show updated profile picture
            window.location.reload();
          }}
          title="Success"
          message={successMessage}
          type="success"
          confirmText="OK"
        />
    </GradientCard>
  );
}

// Summary Card component
function SummaryCard({ notes, setNotes, userId }) {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch admin activity logs (user management actions)
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!userId) return;

      try {
        setLoadingLogs(true);
        const response = await apiService.getAdminActivityLogs(10);

        if (response.success) {
          setActivityLogs(response.data.logs || []);
        } else {
          console.error('Failed to fetch activity logs:', response.message);
          setActivityLogs([]);
        }
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        setActivityLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchActivityLogs();
  }, [userId]);

  // Fetch user notes from database
  useEffect(() => {
    const fetchUserNotes = async () => {
      if (!userId) return;

      try {
        setLoadingNotes(true);
        const response = await apiService.getUserNotes(userId);

        if (response.success) {
          const notesData = response.data.notes || '';
          setNotes(notesData);
          setOriginalNotes(notesData);
        } else {
          console.error('Failed to fetch user notes:', response.message);
        }
      } catch (error) {
        console.error('Error fetching user notes:', error);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchUserNotes();
  }, [userId, setNotes]);

  // Map all activity logs (show all, scrollable if > 5)
  const mappedHistory = activityLogs.map(log => {
    let displayDescription = log.description || "-";

    // For user management actions, prepend employee info if available
    if (log.employee_id && log.employee_id !== '-') {
      const actionType = log.action_display || log.action;
      displayDescription = `${actionType} [Employee ID: ${log.employee_id}${log.employee_name && log.employee_name !== '-' ? ` - ${log.employee_name}` : ''}]: ${log.description}`;
    }

    return {
      created_at: new Date(log.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      action_display: log.action_display || "-",
      description: displayDescription
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [originalNotes, setOriginalNotes] = useState('');
  const [tempNotes, setTempNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleEdit = () => {
    setTempNotes(notes);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSavingNotes(true);
      const response = await apiService.updateUserNotes(userId, tempNotes);

      if (response.success) {
        setNotes(tempNotes);
        setOriginalNotes(tempNotes);
        setIsEditing(false);
        setShowSuccessModal(true);
      } else {
        alert('Failed to save notes: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error saving notes: ' + error.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancel = () => {
    setTempNotes(notes);
    setIsEditing(false);
  };

  return (
    <GradientCard className="rounded-[64px]" isMainCard={true}>
      <div className="space-y-4 sm:space-y-6">
        <div className="text-left">
          <h2 className="text-blue-900 font-semibold sm:text-base">Summary</h2>
          <p className="text-xs">Your activity overview in MetroExecuCare</p>
        </div>

        <GradientCard className="rounded-[24px]">
        <h1 className="text-xs sm:text-xs text-left mb-2">
          <span className="text-blue-900 font-semibold">Action Log:</span> Your recent actions
        </h1>
        {loadingLogs ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
            <span className="ml-2 text-gray-600">Loading activity logs...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table - 2 Column Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <div className={mappedHistory.length > 5 ? "max-h-[200px] overflow-y-auto" : ""}>
                <table className="w-full text-xs table-auto">
                  <thead className="bg-purple-300 sticky top-0">
                    <tr>
                      <th className="p-2 text-center w-32">Date</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedHistory.map((item, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="p-2 text-blue-600 whitespace-nowrap">
                          {item.created_at}
                        </td>
                        <td className="p-2 text-gray-700">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="sm:hidden">
              <div className={mappedHistory.length > 5 ? "max-h-[300px] overflow-y-auto space-y-2" : "space-y-2"}>
                {mappedHistory.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
                    <div className="text-blue-600 font-medium text-xs mb-2">
                      {item.created_at}
                    </div>
                    <div className="text-xs text-gray-700">
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
              {mappedHistory.length > 5 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Scroll to view all {mappedHistory.length} actions
                </p>
              )}
              {mappedHistory.length === 0 && (
                <div className="flex items-center justify-center text-gray-500 text-sm py-4">
                  No recent actions found
                </div>
              )}
            </div>
          </>
        )}
        </GradientCard>

        <GradientCard className="rounded-[24px]">
        <h2 className="text-blue-900 text-sm font-semibold mb-2 text-left sm:text-sm">Notes: Write down notes or reminders of yourself ...</h2>
        <textarea
          className={`w-full rounded-lg px-3 py-2 h-20 sm:h-24 resize-none border text-sm ${
            isEditing
              ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[repeating-linear-gradient(white,white_23px,#e5e7eb_24px)]"
              : "border-gray-200 bg-gray-50 cursor-default"
          }`}
          placeholder={isEditing ? "Write your notes here..." : "No notes yet. Click Edit to add some."}
          value={isEditing ? tempNotes : notes}
          onChange={(e) => setTempNotes(e.target.value)}
          readOnly={!isEditing}
        ></textarea>
        <div className="flex gap-2 mt-2 justify-end">
          {!isEditing ? (
            <CircleButton
              text="Edit"
              color="bg-blue-600"
              onClick={handleEdit}
            />
          ) : (
            <>
              <CircleButton
                text={savingNotes ? "Saving..." : "Save"}
                color="bg-blue-600"
                onClick={handleSave}
              />
              <CircleButton
                text="Cancel"
                color="bg-gray-400"
                onClick={handleCancel}
              />
            </>
          )}
        </div>
        </GradientCard>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center w-full max-w-sm sm:max-w-md">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes Saved Successfully!</h3>
              <p className="text-sm text-gray-600">Your notes have been saved.</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </GradientCard>
  );
}

// Password Change Card component
function PasswordChangeCard() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdate = async () => {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setModalType('passwordMismatch');
      setShowModal(true);
      return;
    }

    // Validate fields are not empty
    if (!currentPassword || !newPassword) {
      setModalType('wrongPassword');
      setShowModal(true);
      return;
    }

    try {
      // Call the backend API to change password
      const response = await apiService.changePassword(currentPassword, newPassword);

      if (response.success) {
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Show success modal
        setModalType('success');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Password change error:', error);

      // Check if it's an incorrect password error
      if (error.response?.status === 400 || error.message.includes('incorrect')) {
        setModalType('wrongPassword');
      } else {
        setModalType('wrongPassword');
      }
      setShowModal(true);
    }
  };

  return (
    <>
      <GradientCard className="rounded-[64px]" isMainCard={true}>
        <h2 className="text-blue-900 text-base sm:text-lg font-semibold mb-4 text-left">
          Change Password
        </h2>

        <div className="space-y-4 pb-2">
          {/* Current Password */}
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 sm:h-12 w-full border border-gray-300 rounded-lg px-4 pr-12
              focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
            <img
            src={showCurrent ? EyeOpen : EyeClose}
            alt={showCurrent ? "Hide password" : "Show password"}
            className="w-5 h-5"
            />
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 sm:h-12 w-full border border-gray-300 rounded-lg px-4 pr-12
              focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
            <img
            src={showNew ? EyeOpen : EyeClose}
            alt={showNew ? "Hide password" : "Show password"}
            className="w-5 h-5"
            />
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10 sm:h-12 w-full border border-gray-300 rounded-lg px-4 pr-12
              focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
            <img
            src={showConfirm ? EyeOpen : EyeClose}
            alt={showConfirm ? "Hide password" : "Show password"}
            className="w-5 h-5"
            />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <div onClick={handleUpdate}>
              <CircleButton text="Update" color="bg-blue-600" />
            </div>
          </div>
        </div>
      </GradientCard>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
            <div className="mb-4">
              {modalType === 'success' && (
                <>
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Updated Successfully!</h3>
                  <p className="text-sm text-gray-600">Your password has been changed successfully.</p>
                </>
              )}
              
              {modalType === 'wrongPassword' && (
                <>
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Incorrect Current Password</h3>
                  <p className="text-sm text-gray-600">The current password you entered is not correct. Please try again.</p>
                </>
              )}
              
              {modalType === 'passwordMismatch' && (
                <>
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Passwords Don't Match</h3>
                  <p className="text-sm text-gray-600">The new password and confirmation password do not match. Please check and try again.</p>
                </>
              )}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // Load profile data and notes from localStorage on component mount
  useEffect(() => {
    const loadProfileData = () => {
      if (user) {
        // Format user data for profile display
        const profileData = {
          id: user.id,
          employeeid: user.employee_id,
          name: `${user.first_name} ${user.last_name}`.trim(),
          firstName: user.first_name,
          lastName: user.last_name,
          position: user.position,
          role: user.role,
          location: user.branch || "Metrobank Fort - Ecoprime Tower",
          email: user.email,
          contact_number: user.contact_number,
          birthDate: user.birth_date ? new Date(user.birth_date).toLocaleDateString() : "Not provided",
          department: user.department,
          avatar: user.profile_picture ? `${apiService.baseURL.replace('/api', '')}${user.profile_picture}` : "",
        };
        setProfile(profileData);
      }
      setLoading(false);
    };

    loadProfileData();
  }, [user]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    navigate("/login", { replace: true });
  };

  const getUserDisplayName = (user) => {
    if (!user) return "Loading...";
    return `${user.first_name} ${user.last_name}`;
  };

  // Show loading state
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-white">
        <NavBarMain
          user={{
            ...user,
            name: getUserDisplayName(user)
          }}
          onLogout={handleLogout}
          showHomeButton={true}
          backButtonIcon={BackSquareIconWhite}
          logo={MetroBankLogo}
        />
        <div className="flex justify-center mt-6 px-4">
          <h1 className="text-[#023184] text-xl font-bold text-center">
            Admin Profile
          </h1>
        </div>
        <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-4 md:px-8 flex justify-center items-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <span className="text-gray-600">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <NavBarMain
        user={{
          ...user,
          name: getUserDisplayName(user)
        }}
        onLogout={handleLogout}
        showHomeButton={true}
        backButtonIcon={BackSquareIconWhite}
        logo={MetroBankLogo}
      />
      <div className="flex justify-center py-1 sm:py-2 px-4">
        <h1 className="text-[#023184] text-base sm:text-lg lg:text-xl font-bold">Admin Profile</h1>
      </div>

      {/* 2-Column Grid Layout - Viewport Fitted */}
      <div className="flex-1 overflow-hidden px-2 sm:px-4 lg:px-6 pb-2 sm:pb-3">
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-4 lg:justify-center lg:items-start max-w-7xl mx-auto h-full">
            {/* Mobile: Stacked Layout */}
            <div className="lg:hidden flex flex-col gap-2 sm:gap-3">
              <ProfileCard profile={profile} setProfile={setProfile} />
              <SummaryCard notes={notes} setNotes={setNotes} userId={profile.id} />
              <PasswordChangeCard />
            </div>

            {/* Desktop: Left Column - Profile and Password Change */}
            <div className="hidden lg:flex flex-col gap-3 lg:w-[45%] xl:w-[40%] h-full">
              <div className="flex-shrink-0">
                <ProfileCard profile={profile} setProfile={setProfile} />
              </div>
              <div className="flex-shrink-0">
                <PasswordChangeCard />
              </div>
            </div>

            {/* Desktop: Right Column - Summary */}
            <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] h-full">
              <div className="w-full">
                <SummaryCard notes={notes} setNotes={setNotes} userId={profile.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}