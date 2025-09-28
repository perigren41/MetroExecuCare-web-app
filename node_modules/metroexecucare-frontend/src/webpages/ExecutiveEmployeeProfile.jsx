import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";
import NavBarMain from "@/Components/NavBarMain";
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/mainLogo-foreground.svg";
import { RollerCoaster } from "lucide-react";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";
import ProfileGray from "@/assets/profilegray.svg";



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
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Upload the image to the backend
        const response = await apiService.uploadProfilePicture(profile.id, file);
        if (response.success) {
          // Update the profile with the new image URL
          setProfile({ ...profile, profile_picture: response.data.profile_picture });
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        // Fallback to local preview for now
        const reader = new FileReader();
        reader.onload = () => setProfile({ ...profile, profile_picture: reader.result });
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl pt-4 pb-6 px-4 sm:px-6 flex flex-col
      outline-2 outline-[#00539F]
      shadow-lg shadow-[#00539F]/50">

      <h2 className="text-blue-900 font-semibold mb-4 text-left text-base sm:text-lg">
        Basic Information
      </h2>

      <div className="flex flex-col lg:flex-row lg:justify-start items-center lg:items-start
      pb-4 gap-4 sm:gap-6 lg:gap-8">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            id="profileImageInput"
            className="hidden"
            onChange={handleImageChange}
          />

          <img
            src={profile.profile_picture || ProfileGray}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full
            border-2 border-purple-400 object-cover"
          />

          <button
            onClick={() => document.getElementById("profileImageInput").click()}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:underline
            text-xs sm:text-sm font-medium transition-colors"
          >
            Change Picture
          </button>
        </div>

        {/* Profile Details Section */}
        <div className="flex flex-col text-center lg:text-left flex-grow space-y-3">
          <div className="mb-2">
            <p className="text-blue-700 font-bold text-xl sm:text-2xl mb-1">
              {`${profile.first_name} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name}`}
            </p>
            <p className="text-gray-600 text-sm sm:text-base">{profile.position}</p>
            <p className="text-gray-500 text-xs sm:text-sm">{profile.branch || 'Not specified'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-bold text-blue-600">Employee ID:</span><br />
              <span className="text-gray-800">{profile.employee_id}</span>
            </div>
            <div>
              <span className="font-bold text-blue-600">Email:</span><br />
              <span className="text-gray-800 break-words">{profile.email}</span>
            </div>
            <div>
              <span className="font-bold text-blue-600">Contact Number:</span><br />
              <span className="text-gray-800">{profile.contact_number}</span>
            </div>
            <div>
              <span className="font-bold text-blue-600">Birth Date:</span><br />
              <span className="text-gray-800">{profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : 'Not provided'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-bold text-blue-600">Department:</span><br />
              <span className="text-gray-800">{profile.department}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary Card component
function SummaryCard({ activityHistory, notes, setNotes, userId }) {
  const [isEditing, setIsEditing] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Process activity history to match expected format
  const processedHistory = activityHistory.map(item => ({
    completed_at: item.completed_at ? new Date(item.completed_at).toLocaleDateString() :
                 item.created_at ? new Date(item.created_at).toLocaleDateString() : "-",
    request_type: item.request_type || "-",
    hospital_name: item.hospital_name || "-",
    current_status: item.current_status || "-",
  }));

  const paddedHistory = [
    ...processedHistory,
    ...Array.from({ length: Math.max(0, 10 - processedHistory.length) }, () => ({
      completed_at: "-",
      request_type: "-",
      hospital_name: "-",
      current_status: "-",
    })),
  ].slice(0, 10);

  const handleSave = async () => {
    if (userId && notes.trim()) {
      try {
        setIsSavingNotes(true);
        await apiService.updateUserNotes(userId, notes);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving notes:', error);
      } finally {
        setIsSavingNotes(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNotes("");
    setIsEditing(true);
  };

  return (
    <div className="bg-white rounded-2xl pt-4 pb-6 px-4 sm:px-6 flex flex-col
      outline-2 outline-[#00539F]
      shadow-lg shadow-[#00539F]/50 gap-4">

      <div className="text-left">
        <h2 className="text-blue-900 font-semibold text-base sm:text-lg">Summary</h2>
        <p className="text-xs sm:text-sm text-gray-600">Your activity overview in MetroExecuCare</p>
      </div>

      {/* Action Log Section */}
      <div className="bg-white rounded-2xl pt-3 pb-4 px-3 sm:px-4 flex flex-col
          outline-1 outline-[#00539F]
          shadow-lg shadow-[#00539F]/50">
        <h3 className="text-xs sm:text-sm text-left mb-3">
          <span className="text-blue-900 font-semibold">Action Log:</span> Your past ten (10) requests
        </h3>

        {/* Responsive Table - Stack on mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs table-auto">
            <thead className="bg-purple-300 text-center">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Request Type</th>
                <th className="p-2">Location</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {paddedHistory.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-2 text-blue-600">{item.completed_at}</td>
                  <td className="p-2">{item.request_type}</td>
                  <td className="p-2">{item.hospital_name}</td>
                  <td className="p-2 font-medium">{item.current_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="sm:hidden space-y-2">
          {paddedHistory.slice(0, 5).map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex justify-between items-start mb-2">
                <span className="text-blue-600 font-medium text-xs">{item.completed_at}</span>
                <span className="text-xs font-medium text-green-600">{item.current_status}</span>
              </div>
              <div className="text-xs space-y-1">
                <p><strong>Request Type:</strong> {item.request_type}</p>
                <p><strong>Location:</strong> {item.hospital_name}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500 text-center mt-2">
            Showing recent 5 requests. View full history on larger screens.
          </p>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-2xl py-4 px-4 sm:px-6 flex flex-col
          outline-1 outline-[#00539F]
          shadow-lg shadow-[#00539F]/50">
        <h3 className="text-blue-900 text-sm sm:text-base font-semibold mb-3 text-left">
          Notes: Write down notes or reminders...
        </h3>
        <textarea
          className="w-full rounded-lg px-3 py-2 h-20 sm:h-24 resize-none border border-gray-300
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          bg-[repeating-linear-gradient(white,white_23px,#e5e7eb_24px)] text-sm"
          placeholder="Write your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          readOnly={!isEditing}
          onFocus={() => setIsEditing(true)}
        />
        <div className="flex gap-2 mt-3 justify-end">
          <CircleButton
            text={isSavingNotes ? "Saving..." : "Save"}
            color="bg-blue-600"
            onClick={handleSave}
          />
          <CircleButton text="Cancel" color="bg-gray-400" onClick={handleCancel} />
        </div>
      </div>
    </div>
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

  const handleUpdate = () => {
    // Simulate checking current password (replace with actual logic)
    const correctCurrentPassword = '1234'; // This would come from your backend

    if (currentPassword !== correctCurrentPassword) {
      setModalType('wrongPassword');
      setShowModal(true);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setModalType('passwordMismatch');
      setShowModal(true);
      return;
    }
    
    // If all validations pass
    setModalType('success');
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl pt-4 pb-4 px-4 sm:px-6 flex flex-col
        outline-2 outline-[#00539F]
        shadow-lg shadow-[#00539F]/50">

        <h2 className="text-blue-900 text-base sm:text-lg font-semibold mb-4 text-left">
          Change Password
        </h2>

        <div className="space-y-4">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showCurrent ? (
                <img src={EyeOpen} alt="Hide password" className="w-5 h-5" />
              ) : (
                <img src={EyeClose} alt="Show password" className="w-5 h-5" />
              )}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNew ? (
                <img src={EyeOpen} alt="Hide password" className="w-5 h-5" />
              ) : (
                <img src={EyeClose} alt="Show password" className="w-5 h-5" />
              )}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? (
                <img src={EyeOpen} alt="Hide password" className="w-5 h-5" />
              ) : (
                <img src={EyeClose} alt="Show password" className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <div onClick={handleUpdate}>
              <CircleButton text="Update" color="bg-blue-600" />
            </div>
          </div>
        </div>
      </div>

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
    profile_picture: "https://i.pravatar.cc/100?img=1",
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
          setActivityHistory(activityResponse.data.logs || []);
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
    <>
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
      <div className="min-h-screen bg-gray-50">
        <div className="pt-6 pb-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-center text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 mb-6">
            Employee Profile
          </h1>

          {loading && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
              {error}
            </div>
          )}

          {/* Responsive Grid Layout */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* Left Column - Profile and Password Change */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <ProfileCard profile={profile} setProfile={setProfile} />
                <PasswordChangeCard />
              </div>

              {/* Right Column - Summary (spans more space on desktop) */}
              <div className="lg:col-span-3">
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
    </>
  );
}