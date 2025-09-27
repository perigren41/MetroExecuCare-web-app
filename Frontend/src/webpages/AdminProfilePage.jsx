import React, { useState, useEffect } from "react";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";
import { RollerCoaster } from "lucide-react";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";
import ProfileGray from "@/assets/profilegray.svg";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/api";



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
  const [uploading, setUploading] = useState(false);

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
          // Update profile with new image URL
          const imageUrl = `${apiService.baseURL.replace('/api', '')}${response.data.profile_picture_url}`;
          setProfile({ ...profile, avatar: imageUrl });

          // Also update localStorage for immediate refresh
          localStorage.setItem(`profile_${profile.id}_picture`, imageUrl);
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

  return (
    <div className="bg-white rounded-2xl pt-3 pb-6 px-6 flex flex-col
      border-2 border-[#00539F]
      shadow-lg shadow-[#00539F]/50">
      
      <h2 className="text-blue-900 font-semibold mb-4 text-left text-base sm:text-base">
        Basic Information
      </h2>

      <div className="flex flex-col md:flex-row md:justify-start 
      items-center md:items-start pb-4 px-4 gap-4 sm:gap-8">

        <div className="flex flex-col md:justify-center items-center pl-0 flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            id="profileImageInput"
            className="hidden"
            onChange={handleImageChange}
          />

          <div className="relative w-20 h-20 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center">
            <img
              src={profile.avatar || ProfileGray}
              alt=""
              className="w-full h-full rounded-full object-cover border-2 border-[#00539F] p-1"
            />
          </div>

          <button
            onClick={() => document.getElementById("profileImageInput").click()}
            disabled={uploading}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:underline text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Change Picture'}
          </button>
        </div>

        <div className="flex flex-col text-center md:text-left px-8 md:px-0 space-y-2 pt-0 w-full md:w-auto">
          <p className="text-blue-700 font-bold text-2xl sm:text-2xl">{profile.name}</p>
          <p className="text-blue-600 text-sm sm:text-xs">{profile.position}</p>
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

// Summary Card component
function SummaryCard({ notes, setNotes, userId }) {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch user activity logs
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!userId) return;

      try {
        setLoadingLogs(true);
        const response = await apiService.getUserActivityLogs(userId, 10);

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

  // Create padded history for display (ensure 10 rows)
  const paddedHistory = [
    ...activityLogs.map(log => ({
      created_at: new Date(log.created_at).toLocaleDateString(),
      description: log.description || log.action,
      request_title: log.request_title || "-",
      action_status: log.action
    })),
    ...Array.from({ length: Math.max(0, 10 - activityLogs.length) }, () => ({
      created_at: "-",
      description: "-",
      request_title: "-",
      action_status: "-",
    })),
  ].slice(0, 10);

  const [isEditing, setIsEditing] = useState(true);
  const [originalNotes, setOriginalNotes] = useState('');

  const handleSave = async () => {
    try {
      setSavingNotes(true);
      const response = await apiService.updateUserNotes(userId, notes);

      if (response.success) {
        setOriginalNotes(notes);
        setIsEditing(false);
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
    setNotes(originalNotes);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl pt-3 pb-6 px-6 flex flex-col 
      outline outline-2 outline-[#00539F] 
      shadow-lg shadow-[#00539F]/50 gap-4">

      <div className="text-left">
        <h2 className="text-blue-900 font-semibold sm:text-base">Summary</h2>
        <p className="text-xs">Your activity overview in MetroExecuCare</p>
      </div>

      <div className="bg-white shadow-md rounded-2xl pt-2 pb-6 px-6 flex flex-col
          border border-[#00539F]
          shadow-[#00539F]/50 gap-2">
        <h1 className="text-xs sm:text-xs text-left">
          <span className="text-blue-900 font-semibold">Action Log:</span> Your past ten (10) actions made
        </h1>
        {loadingLogs ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
            <span className="ml-2 text-gray-600">Loading activity logs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9ca3af #f3f4f6'
        }} 
        onScroll={(e) => {
          // Optional: Add scroll indicators here if needed
        }}
        css={`
          &::-webkit-scrollbar {
            height: 8px;
          }
          &::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 4px;
          }
          &::-webkit-scrollbar-thumb {
            background: #9ca3af;
            border-radius: 4px;
          }
          &::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `}>
          <table className="w-full text-xs table-fixed min-w-[400px]">
            <thead className="bg-purple-200 text-center p-1">
              <tr>
                <th className="p-1">Date</th>
                <th className="p-1">Action</th>
                <th className="p-1">Description</th>
                <th className="p-1">Request</th>
              </tr>
            </thead>
            <tbody>
              {paddedHistory.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-1 text-blue-600">{item.created_at}</td>
                  <td className="p-1">{item.action_status}</td>
                  <td className="p-1">{item.description}</td>
                  <td className="p-1">{item.request_title}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-2xl py-3 px-6 flex flex-col
        border border-[#00539F]
        shadow-[#00539F]/50 text-xs">
        <h2 className="text-blue-900 text-sm font-semibold mb-2 text-left sm:text-sm">Notes: Write down notes or reminders of yourself ...</h2>
        <textarea
          className="w-full rounded-lg px-1 h-22 resize-none bg-[repeating-linear-gradient(white,white_23px,#6b7280_24px)] border-2 border-[#00539F]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          readOnly={!isEditing}
          onFocus={() => setIsEditing(true)}
        ></textarea>
        <div className="flex gap-2 mt-2">
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
        </div>
      </div>
    </div>
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
      <div className="bg-white rounded-2xl pt-3 px-6 pb-3 flex flex-col
        border-2 border-[#00539F]
        shadow-lg shadow-[#00539F]/50">
        
        <h2 className="text-blue-900 text-sm font-semibold mb-4 sm:text-sm text-left">Change Password</h2>
        <div className="space-y-2 text-xs">

          {/* Current Password */}
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-6 w-full border-2 border-[#00539F] rounded-lg p-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showCurrent ? (
                  <img src={EyeOpen} alt="Hide password" className="size-4" />
              ) : (
                <img src={EyeClose} alt="Show password" className="size-4" />
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
              className="h-6 w-full border-2 border-[#00539F] rounded-lg p-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNew ? (
                  <img src={EyeOpen} alt="Hide password" className="size-4" />
              ) : (
                <img src={EyeClose} alt="Show password" className="size-4" />
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
              className="h-6 w-full border-2 border-[#00539F] rounded-lg p-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? (
                  <img src={EyeOpen} alt="Hide password" className="size-4" />
              ) : (
                <img src={EyeClose} alt="Show password" className="size-4" />
              )}
            </button>
          </div>

        <div className="flex justify-end gap-2 mt-2">
          <div onClick={handleUpdate}>
            <CircleButton text="Update" color="bg-blue-600" />
          </div>
        </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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
  const { user } = useAuth();
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

  // Show loading state
  if (loading || !profile) {
    return (
      <>
        <NavBarSide />
        <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900 table-fixed">
          Admin Profile
        </h1>
        <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-4 md:px-8 flex justify-center items-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <span className="text-gray-600">Loading profile...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBarSide />
      <div className="min-h-screen bg-gray-50">
        <div className="pt-6 pb-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-center text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 mb-6">
            Admin Profile
          </h1>

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
                <SummaryCard notes={notes} setNotes={setNotes} userId={profile.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}