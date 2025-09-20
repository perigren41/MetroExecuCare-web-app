import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";
import { RollerCoaster } from "lucide-react";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";

// Import MockUsers data - SAME AS DASHBOARD
import { USERS_DATABASE } from '@/webpages/MockUsers.jsx'; // Adjust path as needed

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
    <div className="bg-white rounded-2xl pt-3 pb-2 px-6 flex flex-col 
      outline outline-2 outline-[#00539F] 
      shadow-lg shadow-[#00539F]/50">
      
      <h2 className="text-blue-900 font-semibold mb-2 text-left text-base sm:text-base">
        Basic Information
      </h2>

      <div className="flex flex-col md:flex-row md:justify-start items-center md:items-center pb-6 px-4 sm:gap-8 gap-4">

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
          <p className="text-blue-600 text-sm sm:text-base">{profile.role}</p>
          <p className="text-gray-500 text-xs sm:text-xs mb-3">{profile.location}</p>

          <div className="sm:text-sm space-y-3">
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
    { completed_at: "2022-11-25", request_type: "Regular Package", hospital_name: "Asian Hospital", current_status: "Completed" },
    { completed_at: "2022-08-30", request_type: "Executive Premium", hospital_name: "Makati Medical Center", current_status: "Completed" },
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
      shadow-lg shadow-[#00539F]/50 gap-4">

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
        <table className="w-full text-xs table-fixed">
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
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-6 w-full border rounded-lg p-2 pr-10"
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
              className="h-6 w-full border rounded-lg p-2 pr-10"
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
              className="h-6 w-full border rounded-lg p-2 pr-10"
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

// Main ExecutiveEmployeeProfile component - CONNECTED TO MOCKUSERS SAME AS DASHBOARD
export default function ExecutiveEmployeeProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // User data state - now connected to MockUsers (EXACT same pattern as Dashboard)
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for profile data (derived from userData)
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState("");

  // Load user data from MockUsers or localStorage - EXACT same logic as Dashboard
  useEffect(() => {
    const loadUserData = () => {
      try {
        // First, check if user data was passed from navigation state (from dashboard)
        if (location.state?.userData) {
          console.log('Loading user data from navigation state:', location.state.userData);
          const currentUser = location.state.userData;
          setUserData(currentUser);
          
          // Transform user data to profile format
          setProfile({
            id: currentUser.id,
            employeeid: currentUser.employeeid,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            position: currentUser.position,
            role: currentUser.role,
            location: currentUser.branch || "Not specified",
            email: currentUser.email,
            contact_number: currentUser.contact_number,
            birthDate: currentUser.birthDate,
            department: currentUser.department,
            branch: currentUser.branch,
            address: currentUser.address,
            avatar: currentUser.profileImage || "https://i.pravatar.cc/100?img=1",
          });
        } else {
          // EXACT same fallback logic as Dashboard
          console.log('No navigation state, checking localStorage...');
          const storedUserData = localStorage.getItem('userData');
          const storedUserId = localStorage.getItem('currentUserId');
          
          console.log('Stored user data:', storedUserData);
          console.log('Stored user ID:', storedUserId);
          
          let currentUser = null;

          if (storedUserData) {
            currentUser = JSON.parse(storedUserData);
            console.log('Found user data in localStorage:', currentUser);
          } else if (storedUserId) {
            // Find user by stored ID
            const userId = parseInt(storedUserId);
            currentUser = USERS_DATABASE.find(user => user.id === userId);
            console.log('Found user by ID in database:', currentUser);
          } else {
            // Default to first executive employee for demo purposes
            console.log('No stored data, using default user...');
            currentUser = USERS_DATABASE.find(user => 
              user.position?.toLowerCase().includes('executive') || 
              user.role?.toLowerCase().includes('executive')
            ) || USERS_DATABASE[2]; // Fallback to Mike Johnson
            console.log('Default user selected:', currentUser);
          }

          if (currentUser) {
            // Transform to standard format (same as Dashboard)
            const standardUser = {
              id: currentUser.id,
              employeeid: currentUser.employeeid,
              email: currentUser.email,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              middleName: currentUser.middleName || "",
              position: currentUser.position,
              role: currentUser.role,
              contact_number: currentUser.contact_number,
              address: currentUser.address || "Not specified",
              department: currentUser.department,
              branch: currentUser.branch,
              birthDate: currentUser.birthDate,
              profileImage: currentUser.profileImage,
              created_at: currentUser.created_at
            };
            
            setUserData(standardUser);
            console.log('Setting standardized user data:', standardUser);
            
            // Transform to profile format for ProfileCard component
            setProfile({
              id: standardUser.id,
              employeeid: standardUser.employeeid,
              name: `${standardUser.firstName} ${standardUser.lastName}`,
              position: standardUser.position,
              role: standardUser.role,
              location: standardUser.branch || "Not specified",
              email: standardUser.email,
              contact_number: standardUser.contact_number,
              birthDate: standardUser.birthDate,
              department: standardUser.department,
              branch: standardUser.branch,
              address: standardUser.address,
              avatar: standardUser.profileImage || "https://i.pravatar.cc/100?img=1",
            });
          } else {
            // If no user found, redirect to login (same as Dashboard)
            console.error('No user data found');
            navigate('/loginpage');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/loginpage');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate, location.state]);

  // Debug effect to log current state
  useEffect(() => {
    console.log('Current userData state:', userData);
    console.log('Current profile state:', profile);
  }, [userData, profile]);

  // Loading state (same as Dashboard)
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If no user data, show error (same as Dashboard)
  if (!userData || !profile) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Unable to load profile data</p>
          <div className="text-sm text-gray-600 mb-4">
            <p>Debug info:</p>
            <p>userData: {userData ? 'exists' : 'null'}</p>
            <p>profile: {profile ? 'exists' : 'null'}</p>
            <p>localStorage userData: {localStorage.getItem('userData') ? 'exists' : 'null'}</p>
            <p>localStorage currentUserId: {localStorage.getItem('currentUserId') || 'null'}</p>
          </div>
          <button 
            onClick={() => navigate('/executive-employee-dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mr-2"
          >
            Return to Dashboard
          </button>
          <button 
            onClick={() => navigate('/loginpage')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBarSide />
      <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900">
        Employee Profile
      </h1>
      <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-4 md:px-8 table-fixed">
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