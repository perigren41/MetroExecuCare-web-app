import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";
import NavBarMain from "@/Components/NavBarMain";
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/mainLogo-foreground.svg";
import { RollerCoaster, X } from "lucide-react";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";
import ProfileGray from "@/assets/profilegray.svg";
import CameraIcon from "@/assets/camera-svgrepo.svg";
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
  const { updateUser, user } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);

  // Helper function to convert relative path to full URL
  const getProfilePictureUrl = (picturePath) => {
    if (!picturePath) return ProfileGray;
    if (picturePath.startsWith('http')) return picturePath;
    if (picturePath.startsWith('data:')) return picturePath; // Base64 preview
    // Convert relative path to full URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
    return `${baseUrl}${picturePath}`;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Upload the image to the backend
        const response = await apiService.uploadProfilePicture(profile.id, file);
        if (response.success) {
          // Update profile with new picture path
          const updatedProfile = {
            ...profile,
            profile_picture: response.data.profile_picture
          };
          setProfile(updatedProfile);

          // Update AuthContext so NavBar reflects the change
          updateUser({
            ...user,
            profile_picture: response.data.profile_picture
          });

          setSuccessMessage('Profile picture updated successfully!');
          setShowSuccessModal(true);
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Failed to upload profile picture. Please try again.');
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
          profile_picture: null
        }));

        // Update AuthContext so NavBar reflects the change
        updateUser({
          ...user,
          profile_picture: null
        });

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
      <h2 className="text-blue-900 font-semibold mb-4 text-left text-base sm:text-lg">
        Basic Information
      </h2>

      <div className="flex flex-col lg:flex-row lg:justify-start items-center lg:items-start
      pb-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Profile Image Section */}
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
              className="flex items-center justify-center gap-2 text-blue-600 hover:underline text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <img src={CameraIcon} alt="camera" className="w-4 h-4 sm:w-5 sm:h-5" />
              Change Picture
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

        {/* Profile Details Section */}
        <div className="flex flex-col text-center lg:text-left flex-grow space-y-3">
          <p className="text-blue-700 font-bold text-2xl sm:text-2xl">
            {`${profile.first_name} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name}`}
          </p>
          <p className="text-gray-600 text-sm sm:text-xs">{profile.position}</p>
          <p className="text-gray-500 text-xs sm:text-xs mb-2">{profile.branch || 'Not specified'}</p>

          <div className="sm:text-sm space-y-2">
            <p>
              <span className="font-bold text-blue-600 text-sm">Employee ID:</span><br />
              <span className="text-black text-xs">{profile.employee_id}</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Email:</span><br />
              <span className="text-black text-xs break-words">{profile.email}</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Contact Number:</span><br />
              <span className="text-black text-xs">{profile.contact_number}</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Birth Date:</span><br />
              <span className="text-black text-xs">{profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : 'Not provided'}</span>
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
function SummaryCard({ activityHistory, notes, setNotes, userId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes);

  // Helper function to format status (for backward compatibility)
  const getStatusDisplay = (status) => {
    if (!status || status === "-") return { text: "-", color: "text-gray-500" };

    const statusLower = status.toLowerCase();

    // Convert backend naming to user-friendly format
    let displayText = status;

    // Replace underscores with spaces and capitalize words
    displayText = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Determine color based on status type
    if (statusLower.includes("approved") || statusLower.includes("completed")) {
      return { text: displayText, color: "text-green-600" };
    } else if (statusLower.includes("rejected") || statusLower.includes("denied")) {
      return { text: displayText, color: "text-red-600" };
    } else if (statusLower.includes("pending") || statusLower.includes("review") ||
               statusLower.includes("processing") || statusLower.includes("waiting")) {
      return { text: displayText, color: "text-orange-600" };
    }
    return { text: displayText, color: "text-blue-600" };
  };

  // Process activity history to match expected format
  const processedHistory = activityHistory.map(item => ({
    created_at: new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    description: item.description || "-"
  }));

  const handleEdit = () => {
    setTempNotes(notes);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSavingNotes(true);
      if (userId) {
        await apiService.updateUserNotes(userId, tempNotes);
      }
      setNotes(tempNotes);
      setIsEditing(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSavingNotes(false);
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
          <h2 className="text-blue-900 font-semibold text-base sm:text-lg">Summary</h2>
          <p className="text-xs sm:text-sm text-gray-600">Your activity overview in MetroExecuCare</p>
        </div>

        {/* Action Log Section */}
        <GradientCard className="rounded-[24px]">
        <h3 className="text-xs sm:text-sm text-left mb-3">
          <span className="text-blue-900 font-semibold">Action Log:</span> Your recent actions
        </h3>

        {processedHistory.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            No activity logs found
          </div>
        ) : (
          <>
            {/* Desktop Table - 2 Column Layout */}
            <div className="hidden sm:block overflow-x-auto relative">
              <div className={processedHistory.length > 5 ? "max-h-[200px] overflow-y-auto scroll-smooth shadow-inner rounded-lg border border-gray-200" : ""}>
                <table className="w-full text-xs table-auto">
                  <thead className="bg-purple-300 sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-center w-32">Date</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedHistory.map((item, idx) => (
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
              {processedHistory.length > 5 && (
                <div className="text-center mt-2 text-xs text-gray-500 italic">
                  ↕️ Scroll to view more actions
                </div>
              )}
            </div>

            {/* Mobile Card Layout */}
            <div className="sm:hidden relative">
              <div className={processedHistory.length > 5 ? "max-h-[300px] overflow-y-auto space-y-2 scroll-smooth shadow-inner rounded-lg border border-gray-200 p-2" : "space-y-2"}>
                {processedHistory.map((item, idx) => (
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
              {processedHistory.length > 5 && (
                <p className="text-xs text-gray-500 text-center mt-2 italic">
                  ↕️ Scroll to view all {processedHistory.length} actions
                </p>
              )}
            </div>
          </>
        )}
        </GradientCard>

        {/* Notes Section */}
        <GradientCard className="rounded-[24px]">
        <h3 className="text-blue-900 text-sm sm:text-base font-semibold mb-3 text-left">
          Notes: Write down notes or reminders...
        </h3>
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
        />
        <div className="flex gap-2 mt-3 justify-end">
          {!isEditing ? (
            <CircleButton
              text="Edit"
              color="bg-blue-600"
              onClick={handleEdit}
            />
          ) : (
            <>
              <CircleButton
                text={isSavingNotes ? "Saving..." : "Save"}
                color="bg-blue-600"
                onClick={handleSave}
              />
              <CircleButton text="Cancel" color="bg-gray-400" onClick={handleCancel} />
            </>
          )}
        </div>
        </GradientCard>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
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
              onClick={() => {
                setShowSuccessModal(false);
                // Reload to refresh activity logs
                window.location.reload();
              }}
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

// Password ChangeCard component
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center w-full max-w-sm sm:max-w-md">
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
              onClick={() => {
                setShowModal(false);
                // Reload page if password was successfully changed
                if (modalType === 'success') {
                  window.location.reload();
                }
              }}
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

// Main ExecutiveEmployeeProfile component
export default function ExecutiveEmployeeProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    id: null,
    employee_id: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    position: "",
    role: "",
    branch: "",
    email: "",
    contact_number: "",
    birth_date: "",
    department: "",
    profile_picture: "",
  });

  const [activityHistory, setActivityHistory] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load user profile
      const userResponse = await apiService.getUserById(user.id);
      if (userResponse.success) {
        setProfile(userResponse.data.user);
      }

      // Load user activity logs (handle errors gracefully)
      try {
        const activityResponse = await apiService.getUserActivityLogs(user.id, 10);
        if (activityResponse.success) {
          setActivityHistory(activityResponse.data.logs || activityResponse.data || []);
        }
      } catch (activityError) {
        console.warn('Activity logs unavailable:', activityError.message);
        // Set empty array so the profile still loads
        setActivityHistory([]);
      }

      // Load user notes (handle errors gracefully)
      try {
        const notesResponse = await apiService.getUserNotes(user.id);
        if (notesResponse.success) {
          setNotes(notesResponse.data.notes || "");
        }
      } catch (notesError) {
        console.warn('User notes unavailable:', notesError.message);
        // Set empty string so the profile still loads
        setNotes("");
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <NavBarMain
        user={{
          ...user,
          name: user ? `${user.first_name} ${user.last_name}` : "Loading..."
        }}
        onLogout={() => {
          sessionStorage.removeItem("user");
          sessionStorage.clear();
          localStorage.removeItem('authToken');
          navigate("/login", { replace: true });
        }}
        showHomeButton={true}
        backButtonIcon={BackSquareIconWhite}
        logo={MetroBankLogo}
      />
        <div className="flex justify-center mt-2 sm:mt-3 lg:mt-4 px-4">
          <h1 className="text-[#023184] text-lg sm:text-xl lg:text-2xl font-bold">Employee Profile</h1>
        </div>

        {loading && (
          <div className="flex justify-center mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="flex justify-center mt-6 px-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl text-center">
              {error}
            </div>
          </div>
        )}

        {/* 2-Column Grid Layout - Matching Screenshot */}
        <div className="flex justify-center py-2 sm:py-3 lg:py-3 px-3 sm:px-4 lg:px-6 overflow-hidden">
          <div className="w-full h-[calc(100vh-130px)] overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-5 lg:justify-center lg:items-start max-w-7xl mx-auto">
              {/* Mobile: Basic Info */}
              <div className="lg:hidden">
                <ProfileCard profile={profile} setProfile={setProfile} />
              </div>

              {/* Mobile: Summary */}
              <div className="lg:hidden w-full">
                <SummaryCard
                  activityHistory={activityHistory}
                  notes={notes}
                  setNotes={setNotes}
                  userId={user?.id}
                />
              </div>

              {/* Mobile: Change Password */}
              <div className="lg:hidden">
                <PasswordChangeCard />
              </div>

              {/* Desktop: Left Column - Profile and Password Change */}
              <div className="hidden lg:flex flex-col gap-3 lg:w-[480px] xl:w-[520px] self-stretch">
                <ProfileCard profile={profile} setProfile={setProfile} />
                <PasswordChangeCard />
              </div>

              {/* Desktop: Right Column - Summary */}
              <div className="hidden lg:flex lg:w-[640px] xl:w-[720px] self-stretch">
                <SummaryCard
                  activityHistory={activityHistory}
                  notes={notes}
                  setNotes={setNotes}
                  userId={user?.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}