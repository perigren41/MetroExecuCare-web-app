import React, { useState } from "react";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";
import { RollerCoaster } from "lucide-react";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";
import ErrorPass from "@/assets/errorpasstriangle.svg";
import CheckGreen from "@/assets/checkgreen.svg";
import XIcon from "@/assets/xicon.svg";

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
      
      <h2 className="text-blue-900 font-semibold mb-4 text-left text-base">
        Basic Information
      </h2>

      <div className="flex flex-col md:flex-row md:justify-start items-center md:items-start pb-4 px-4 gap-4 sm:gap-8">

        <div className="flex flex-col md:justify-center items-center pl-0 flex-shrink-0">
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
            className="w-50 h-50 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-2 border-purple-400 object-cover"
          />

          <button
            onClick={() => document.getElementById("profileImageInput").click()}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:underline text-sm"
          >
            Change Picture
          </button>
        </div>

        <div className="flex flex-col text-center md:text-left px-8 md:px-0 space-y-2 pt-0 w-full md:w-auto">
          <p className="text-blue-700 font-bold text-2xl">{profile.name}</p>
          <p className="text-blue-600 text-xs">{profile.position}</p>
          <p className="text-gray-500 text-xs mb-2">{profile.location}</p>

          <div className="text-sm space-y-2">
            <p>
              <span className="font-bold text-blue-600 text-sm">Employee ID:</span><br />
              <span className="text-black text-xs">{profile.employeeid}</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Email:</span><br />
              <span className="text-black text-xs break-all">{profile.email}</span>
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
    { created_at: "2024-11-15", employeeid: "EMP001", name: "Makati Medical Center", action_status: "Added" },
    { created_at: "2024-08-22", employeeid: "EMP002", name: "St. Lukes Medical Center", action_status: "Deleted" },
    { created_at: "2024-05-10", employeeid: "EMP003", name: "The Medical City Clinic", action_status: "Updated" },
    { created_at: "2024-02-18", employeeid: "EMP004", name: "Asian Hospital", action_status: "Added" },
    { created_at: "2023-11-20", employeeid: "EMP005", name: "Makati Medical Center", action_status: "Added" },
    { created_at: "2023-08-14", employeeid: "EMP006", name: "Cardinal Santos", action_status: "Updated" },
    { created_at: "2023-05-05", employeeid: "EMP007", name: "St. Lukes Medical Center", action_status: "Deleted" },
    { created_at: "2023-02-12", employeeid: "EMP008", name: "The Medical City Clinic", action_status: "Added" },
  ];

  const paddedHistory = [
    ...history,
    ...Array.from({ length: Math.max(0, 10 - history.length) }, () => ({
      date_Added: "-",
      employeeid: "-",
      name: "-",
      action_status: "-",
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
        <h2 className="text-blue-900 font-semibold text-base">Summary</h2>
        <p className="text-xs">Your activity overview in MetroExecuCare</p>
      </div>

      <div className="bg-white shadow-md rounded-2xl pt-2 pb-6 px-6 flex flex-col 
          outline outline-1 outline-[#00539F] 
          shadow-lg shadow-[#00539F]/50 gap-2">
        <h1 className="text-xs text-left">
          <span className="text-blue-900 font-semibold">Action Log:</span> Your past ten (10) actions made
        </h1>
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
                <th className="p-1 w-[25%]">Date Added</th>
                <th className="p-1 w-[22%]">Employee ID</th>
                <th className="p-1 w-[35%]">Name</th>
                <th className="p-1 w-[18%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {paddedHistory.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-1 text-blue-600 truncate" title={item.created_at}>{item.created_at}</td>
                  <td className="p-1 truncate" title={item.employeeid}>{item.employeeid}</td>
                  <td className="p-1 truncate" title={item.name}>{item.name}</td>
                  <td className="p-1 truncate" title={item.action_status}>{item.action_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-2xl py-3 px-6 flex flex-col 
          outline outline-1 outline-[#00539F] 
          shadow-lg shadow-[#00539F]/50 text-xs">
        <h2 className="text-blue-900 text-sm font-semibold mb-2 text-left">Notes: Write down notes or reminders of yourself ...</h2>
        <h4 className="text-blue-900 font-semibold mb-2 text-left">Click your notes to edit.</h4>
        <textarea
          className="w-full rounded-lg px-4 py-3 h-32 md:h-44 xl:h-24 resize-none border border-gray-300
          bg-white bg-[repeating-linear-gradient(transparent,_transparent_27px,_#cbd5e1_28px,_transparent_29px)]
          leading-7 font-mono text-gray-800"
          placeholder="Click here to write your notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          readOnly={!isEditing}
          onFocus={() => setIsEditing(true)}
          style={{ lineHeight: '28px' }}
        ></textarea>
        <div className="flex gap-2 mt-2">
          <CircleButton text="Save" color="bg-blue-600" onClick={handleSave} />
          <CircleButton text="Cancel" color="bg-gray-400" onClick={handleCancel} />
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
        outline outline-2 outline-[#00539F] 
        shadow-lg shadow-[#00539F]/50">
        
        <h2 className="text-blue-900 text-sm font-semibold mb-4 text-left">Change Password</h2>
        <div className="space-y-2 text-xs">

          {/* Current Password */}
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder=" "
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-6 w-full border rounded-lg p-2 pr-10 peer"
            />
            <label className="absolute left-2 top-0 text-xs text-gray-500 bg-white px-1 transition-all duration-200 ease-in-out 
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs
              peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600
              -translate-y-1/2">
              Current Password
            </label>
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
              placeholder=" "
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-6 w-full border rounded-lg p-2 pr-10 peer"
            />
            <label className="absolute left-2 top-0 text-xs text-gray-500 bg-white px-1 transition-all duration-200 ease-in-out 
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs
              peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600
              -translate-y-1/2">
              New Password
            </label>
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
              placeholder=" "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-6 w-full border rounded-lg p-2 pr-10 peer"
            />
            <label className="absolute left-2 top-0 text-xs text-gray-500 bg-white px-1 transition-all duration-200 ease-in-out 
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs
              peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600
              -translate-y-1/2">
              Confirm New Password
            </label>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-4xl shadow-lg text-center w-full max-w-xs sm:max-w-sm">
            <div className="mb-4">
              {modalType === 'success' && (
                <>
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <img src={CheckGreen} alt="Success" className="w-8 h-8 sm:w-10 sm:h-10"></img>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Password Updated Successfully!</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Your password has been changed successfully.</p>
                </>
              )}
              
              {modalType === 'wrongPassword' && (
                <>
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <img src={XIcon} alt="Close" className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Incorrect Current Password</h3>
                  <p className="text-xs sm:text-sm text-gray-600">The current password you entered is not correct. Please try again.</p>
                </>
              )}
              
              {modalType === 'passwordMismatch' && (
                <>
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <img src={ErrorPass} alt="Error" className="w-8 h-8 sm:w-10 sm:h-10"></img>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Passwords Don't Match</h3>
                  <p className="text-xs sm:text-sm text-gray-600">The new password and confirmation password do not match. Please check and try again.</p>
                </>
              )}
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="w-16 sm:w-20 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
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
        <div className="
                grid grid-cols-1 
                lg:grid-cols-[46%_54%]
                gap-4 
                md:gap-4 md:pr-13 md:pl-10 
                sm:pr-2 sm:pl-2
              ">
          
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