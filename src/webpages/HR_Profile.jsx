// src/pages/HRProfilePage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Add useLocation and useNavigate
import { mockUser } from "../webpages/mockUser";
import NavBarMain from "@/Components/NavBarMain";
import EyeOpenIcon from "@/assets/eyeopen.svg";
import EyeCloseIcon from "@/assets/eyeclose.svg";
import CameraIcon from "@/assets/camera-svgrepo.svg";

/* ---------------- GradientCard wrapper ---------------- */
function GradientCard({ children, className, style, isMainCard = false }) {
    const roundedClass = className?.match(/rounded-\[?[\w-]+\]?/)?.[0];

    let outerRounded, innerRadius;
    if (roundedClass === "rounded-[64px]") {
        outerRounded = "rounded-[64px]";
        innerRadius = "rounded-[calc(64px-3px)]";
    } else if (roundedClass === "rounded-[32px]") {
        outerRounded = "rounded-[32px]";
        innerRadius = "rounded-[calc(32px-3px)]";
    } else {
        outerRounded = "rounded-3xl";
        innerRadius = "rounded-[calc(1.5rem-3px)]";
    }

    const cleanClassName =
        className?.replace(/rounded-\[?[\w-]+\]?/g, "").trim() || "";

    return (
        <div
            className={`${outerRounded} p-[3px] shadow-sm ${cleanClassName}`}
            style={{
                background:
                    "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                ...style,
            }}
        >
            <div
                className={`bg-white ${innerRadius} h-full w-full ${isMainCard ? "px-[93px] py-8" : "p-4"
                    }`}
            >
                {children}
            </div>
        </div>
    );
}

/* ---------------- CircleButton ---------------- */
function CircleButton({ text, color, onClick }) {
    return (
        <button
            className={`${color} text-white px-6 py-1 rounded-full hover:opacity-80 transition text-sm font-medium`}
            onClick={onClick}
        >
            {text}
        </button>
    );
}


/* ---------------- ProfileCard ---------------- */
function ProfileCard({ profile, setProfile }) {
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () =>
                setProfile({ ...profile, profilePic: reader.result });
            reader.readAsDataURL(file);
        }
    };

    return (
        <GradientCard
            style={{ width: "788px", height: "577px" }}
            className="rounded-[64px] p-8"
            isMainCard={true}
        >
            <h2 className="text-[#023184] font-semibold mb-8 text-left text-lg">
                Basic Information
            </h2>

            <div className="flex gap-8">
                {/* Left - Profile Picture */}
                <div className="flex flex-col items-center w-[305px]">
                    <input
                        type="file"
                        accept="image/*"
                        id="profileImageInput"
                        className="hidden"
                        onChange={handleImageChange}
                    />

                    <div className="w-[305px] h-[305px] rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                        <img
                            src={profile.profilePic}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <button
                        onClick={() =>
                            document.getElementById("profileImageInput").click()
                        }
                        className="mt-4 text-[#023184] hover:underline text-sm flex items-center gap-2"
                    >
                        <img src={CameraIcon} alt="camera" className="w-5 h-5" />
                        Change Picture
                    </button>
                </div>

                {/* Right - Info & Details */}
                <div className="flex-1 flex flex-col space-y-4 items-start text-left">
                    <div>
                        <h3 className="text-4xl font-bold text-blue-900">
                            {profile.name}
                        </h3>
                        <p className="text-[#023184] font-semibold text-lg">
                            {profile.position}
                        </p>
                        <p className="text-gray-600">{profile.location}</p>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div>
                            <span className="font-semibold text-[#023184]">
                                Employee ID:
                            </span>
                            <br />
                            <span className="text-gray-700">
                                {profile.employeeId}
                            </span>
                        </div>

                        <div>
                            <span className="font-semibold text-[#023184]">
                                Email Address:
                            </span>
                            <br />
                            <span className="text-gray-700">{profile.email}</span>
                        </div>

                        <div>
                            <span className="font-semibold text-[#023184]">
                                Contact Number:
                            </span>
                            <br />
                            <span className="text-gray-700">
                                {profile.contactNumber}
                            </span>
                        </div>

                        <div>
                            <span className="font-semibold text-[#023184]">
                                Birth Date:
                            </span>
                            <br />
                            <span className="text-gray-700">{profile.birthDate}</span>
                        </div>

                        <div>
                            <span className="font-semibold text-[#023184]">
                                Department:
                            </span>
                            <br />
                            <span className="text-gray-700">
                                {profile.department}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </GradientCard>
    );
}


// PasswordChangeCard component
function PasswordChangeCard() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("success");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleUpdate = () => {
        const correctCurrentPassword = "1234";

        if (currentPassword !== correctCurrentPassword) {
            setModalType("wrongPassword");
            setShowModal(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setModalType("passwordMismatch");
            setShowModal(true);
            return;
        }

        setModalType("success");
        setShowModal(true);
    };

    const toggleVisibility = (field) => {
        if (field === "current") setShowCurrent(!showCurrent);
        if (field === "new") setShowNew(!showNew);
        if (field === "confirm") setShowConfirm(!showConfirm);
    };

    return (
        <>
            <GradientCard
                style={{ width: "788px", height: "222px" }}
                className="rounded-[64px]"
                isMainCard={true}
            >
                <h2 className="text-left text-[#023184] text-lg font-semibold mb-3">
                    Change Password
                </h2>

                <div className="space-y-2">
                    {/* Current Password */}
                    <div className="relative">
                        <input
                            type={showCurrent ? "text" : "password"}
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-md h-[21px] px-3 pr-8 text-s focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            type="button"
                            onClick={() => toggleVisibility("current")}
                            className="absolute inset-y-0 right-0 flex items-center pr-2"
                        >
                            <img
                                src={showCurrent ? EyeOpenIcon : EyeCloseIcon}
                                alt={showCurrent ? "Hide password" : "Show password"}
                                className="w-4 h-4"
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
                            className="w-full border border-gray-300 rounded-md h-[21px] px-3 pr-8 text-s focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            type="button"
                            onClick={() => toggleVisibility("new")}
                            className="absolute inset-y-0 right-0 flex items-center pr-2"
                        >
                            <img
                                src={showNew ? EyeOpenIcon : EyeCloseIcon}
                                alt={showNew ? "Hide password" : "Show password"}
                                className="w-4 h-4"
                            />
                        </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-md h-[21px] px-3 pr-8 text-s focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            type="button"
                            onClick={() => toggleVisibility("confirm")}
                            className="absolute inset-y-0 right-0 flex items-center pr-2"
                        >
                            <img
                                src={showConfirm ? EyeOpenIcon : EyeCloseIcon}
                                alt={showConfirm ? "Hide password" : "Show password"}
                                className="w-4 h-4"
                            />
                        </button>
                    </div>

                    {/* Update Button */}
                    <div className="flex justify-end pt-1">
                        <CircleButton
                            text="Update"
                            color="bg-[#023184]"
                            onClick={handleUpdate}
                        />
                    </div>
                </div>
            </GradientCard>

            {/* Modal (unchanged) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-3xl shadow-lg text-center w-96">
                        {/* same modal content */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

import { CheckCircle, XCircle } from "lucide-react"; // icons

// RequestsSummaryCard component
function RequestsSummaryCard() {
  const totalRequests = 30;
  const approvedRequests = 23;
  const rejectedRequests = 7;

  return (
    <GradientCard className="rounded-[24px] p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
      {/* Total Requests */}
      <div className="flex flex-col items-center mb-8">
        <h3 className="text-[#023184] font-semibold text-m text-center max-w-[280px] mb-2">
          Total Requests Reviewed This Year
        </h3>
        <div className="text-5xl font-bold text-gray-700 leading-none">
          {totalRequests}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-300 mb-4" />

      {/* Approved vs Rejected */}
      <div className="flex">
        {/* Approved */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-[#023184] font-semibold text-sm">Approved</p>
          </div>
          <p className="text-3xl font-bold text-gray-700">{approvedRequests}</p>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-300 mx-4 self-stretch"></div>

        {/* Rejected */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <p className="text-[#023184] font-semibold text-sm">Rejected</p>
          </div>
          <p className="text-3xl font-bold text-gray-700">{rejectedRequests}</p>
        </div>
      </div>
    </GradientCard>
  );
}

// ActionLogCard component
function ActionLogCard() {
    const recentActions = [
        {
            date: "04/20/2025",
            action: "Forwarded LOAuth #0123 to Benefits Services Officer",
        },
        { date: "04/17/2025", action: "Reviewed LOAuth #0122" },
        { date: "04/15/2025", action: "Approved LOApp #0119" },
    ];

    return (
        <GradientCard className="rounded-[32px] h-full flex flex-col">
            <h3 className="text-[#023184] font-semibold mb-4 text-m text-left">
                Action Log: Last three (3) actions made
            </h3>

            <div className="space-y-3 flex-1">
                {recentActions.map((item, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-200 last:border-b-0"
                    >
                        {/* Date column - takes up 1 column */}
                        <div className="col-span-1 text-[#023184] font-medium text-sm text-left border-r border-gray-300 pr-4">
                            {item.date}
                        </div>
                        
                        {/* Action column - takes up 4 columns with truncation */}
                        <div className="col-span-4 text-gray-700 text-sm leading-relaxed text-left truncate pl-2">
                            {item.action}
                        </div>
                    </div>
                ))}
            </div>
        </GradientCard>
    );
}

// NotesCard component with better line alignment
function NotesCard({ notes, setNotes }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempNotes, setTempNotes] = useState(notes);

    const handleEdit = () => {
        setTempNotes(notes);
        setIsEditing(true);
    };

    const handleSave = () => {
        setNotes(tempNotes);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempNotes(notes);
        setIsEditing(false);
    };

    return (
        <GradientCard className="rounded-[32px] h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#023184] font-semibold text-m text-left">
                    Notes / Reminders
                </h3>
                {!isEditing && (
                    <CircleButton 
                        text="Edit" 
                        color="bg-[#023184]" 
                        onClick={handleEdit} 
                    />
                )}
            </div>

            <textarea
                className={`flex-1 w-full border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-0 ${
                    isEditing 
                        ? "border-gray-300 bg-white" 
                        : "border-gray-200 bg-gray-50 cursor-default"
                }`}
                style={{
                    fontSize: '16px',
                    lineHeight: '24px',
                    padding: '12px',
                    paddingTop: '8px', // Adjust top padding to align first line
                    backgroundImage: isEditing
                        ? "repeating-linear-gradient(transparent 0px, transparent 22px, #e5e7eb 22px, #e5e7eb 23px)"
                        : "none",
                    backgroundSize: "100% 24px",
                    backgroundAttachment: "local",
                    backgroundPosition: "0 8px" // Offset background to match padding-top
                }}
                value={isEditing ? tempNotes : notes}
                onChange={(e) => isEditing && setTempNotes(e.target.value)}
                readOnly={!isEditing}
                placeholder={isEditing ? "Write your notes..." : "No notes yet. Click Edit to add some."}
            />

            {isEditing && (
                <div className="flex gap-2 mt-4 justify-end">
                    <CircleButton 
                        text="Save" 
                        color="bg-[#023184]" 
                        onClick={handleSave} 
                    />
                    <CircleButton 
                        text="Cancel" 
                        color="bg-gray-400" 
                        onClick={handleCancel} 
                    />
                </div>
            )}
        </GradientCard>
    );
}




function SummaryCard({ notes, setNotes }) {
    return (
        <GradientCard
            style={{ width: "788px", height: "831px" }}
            className="rounded-[64px] flex flex-col"
            isMainCard={true}
        >
            <div className="text-left mb-4">
                <h2 className="text-[#023184] font-semibold text-lg mb-1">Summary</h2>
                <p className="text-gray-600 text-sm">Your activity overview in MetroExecuCare</p>
            </div>

            {/* Change this div to use equal height distribution */}
            <div className="flex flex-col gap-6 flex-1">
                <div className="flex-1">
                    <RequestsSummaryCard />
                </div>
                <div className="flex-1">
                    <ActionLogCard />
                </div>
                <div className="flex-1">
                    <NotesCard notes={notes} setNotes={setNotes} />
                </div>
            </div>
        </GradientCard>
    );
}


/* ---------------- Main HRProfilePage ---------------- */
export default function HRProfilePage() {
    const location = useLocation(); // Add this
    const navigate = useNavigate(); // Add this
    const user = location.state?.user || mockUser; // Change this
    
    const [profile, setProfile] = useState(user); // Use the correct user
    const [notes, setNotes] = useState("");

    const handleBackClick = () => {
        // Navigate back to the previous page with user data
        navigate(-1);
    };
    
    const handleProfileClick = () => { 
        // Already on profile page, do nothing
    };
    
    const handleLogout = () => {
        navigate("/LoginPage");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBarMain
                user={user} // Use the correct user
                onBackClick={handleBackClick}
                customProfileClick={handleProfileClick}
                customLogout={handleLogout}
                showBackButton={true}
                showProfileOption={true}
                showDropdown={true}
            />

            <div className="flex justify-center mt-[43px]">
                <h1 className="text-[#023184] text-[28px] font-bold">Profile</h1>
            </div>

            <div className="flex justify-center py-8 px-6">
                <div className="flex gap-8">
                    {/* Left Column */}
                    <div className="flex flex-col gap-8">
                        <ProfileCard profile={profile} setProfile={setProfile} />
                        <PasswordChangeCard />
                    </div>

                    {/* Right Column */}
                    <SummaryCard notes={notes} setNotes={setNotes} />
                </div>
            </div>
        </div>
    );
}