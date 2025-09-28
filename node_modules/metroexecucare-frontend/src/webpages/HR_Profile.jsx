// src/pages/HRProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NavBarMain from "@/Components/NavBarMain";
import apiService from "@/services/api";
import EyeOpenIcon from "@/assets/eyeopen.svg";
import EyeCloseIcon from "@/assets/eyeclose.svg";
import CameraIcon from "@/assets/camera-svgrepo.svg";

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
        innerPadding = "px-4 py-4 sm:px-8 sm:py-6 lg:px-[93px] lg:py-8";
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

    // Helper function to get display name
    const getDisplayName = (profile) => {
        return `${profile.first_name} ${profile.last_name}`;
    };

    // Helper function to get default profile image
    const getProfileImage = (profile) => {
        if (profile.profilePic) {
            return profile.profilePic;
        }
        // Return a default avatar or create one with initials
        return `data:image/svg+xml;base64,${btoa(`
            <svg width="305" height="305" xmlns="http://www.w3.org/2000/svg">
                <rect width="305" height="305" fill="#e5e7eb"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".1em" font-size="120" fill="#6b7280">
                    ${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}
                </text>
            </svg>
        `)}`;
    };

    return (
        <GradientCard
            className="rounded-[64px] w-full xl:w-[788px] xl:h-[577px]"
            isMainCard={true}
        >
            <h2 className="text-[#023184] font-semibold mb-4 sm:mb-6 lg:mb-8 text-left text-base sm:text-lg">
                Basic Information
            </h2>

            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8">
                {/* Left - Profile Picture */}
                <div className="flex flex-col items-center w-full xl:w-[305px] flex-shrink-0">
                    <input
                        type="file"
                        accept="image/*"
                        id="profileImageInput"
                        className="hidden"
                        onChange={handleImageChange}
                    />

                    <div className="w-32 h-32 sm:w-48 sm:h-48 xl:w-[305px] xl:h-[305px] rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                        <img
                            src={getProfileImage(profile)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <button
                        onClick={() =>
                            document.getElementById("profileImageInput").click()
                        }
                        className="mt-2 sm:mt-4 text-[#023184] hover:underline text-sm flex items-center gap-2"
                    >
                        <img src={CameraIcon} alt="camera" className="w-4 h-4 sm:w-5 sm:h-5" />
                        Change Picture
                    </button>
                </div>

                {/* Right - Info & Details */}
                <div className="flex-1 flex flex-col space-y-3 sm:space-y-4 items-start text-left">
                    <div>
                        <h3 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-blue-900">
                            {getDisplayName(profile)}
                        </h3>
                        <p className="text-[#023184] font-semibold text-base sm:text-lg">
                            {profile.position}
                        </p>
                        <p className="text-gray-600 text-sm sm:text-base">{profile.location}</p>
                    </div>

                    <div className="space-y-3 sm:space-y-4 text-sm">
                        <div>
                            <span className="font-semibold text-[#023184]">Employee ID:</span>
                            <br />
                            <span className="text-gray-700 break-words">{profile.employee_id}</span>
                        </div>

                        <div>
                            <span className="font-semibold text-[#023184]">Email Address:</span>
                            <br />
                            <span className="text-gray-700 break-words">{profile.email}</span>
                        </div>

                        <div>
                            <span className="font-semibold text-[#023184]">Contact Number:</span>
                            <br />
                            <span className="text-gray-700 break-words">{profile.contact_number}</span>
                        </div>

                        <div>
                            <span className="font-semibold text-[#023184]">Birth Date:</span>
                            <br />
                            <span className="text-gray-700 break-words">{profile.birth_date}</span>
                        </div>

                        <div>
                            <span className="font-semibold text-[#023184]">Department:</span>
                            <br />
                            <span className="text-gray-700 break-words">{profile.department}</span>
                        </div>
                    </div>
                </div>
            </div>
        </GradientCard>
    );
}

// PasswordChangeCard component
function PasswordChangeCard({ user }) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("success");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleUpdate = () => {
        const correctCurrentPassword = user?.password || "1234";
        
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

        if (!newPassword.trim()) {
            setModalType("emptyPassword");
            setShowModal(true);
            return;
        }

        setModalType("success");
        setShowModal(true);
        
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const toggleVisibility = (field) => {
        if (field === "current") setShowCurrent(!showCurrent);
        if (field === "new") setShowNew(!showNew);
        if (field === "confirm") setShowConfirm(!showConfirm);
    };

    return (
        <>
            <GradientCard
                className="rounded-[64px] w-full xl:w-[788px] xl:h-[222px]"
                isMainCard={true}
            >
                <h2 className="text-left text-[#023184] text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                    Change Password
                </h2>

                {/* Fixed spacing and height for better alignment */}
                <div className="space-y-2 xl:space-y-1">
                    {/* Current Password */}
                    <div className="relative">
                        <input
                            type={showCurrent ? "text" : "password"}
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-md h-8 sm:h-10 xl:h-[26px] px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            type="button"
                            onClick={() => toggleVisibility("current")}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 xl:pr-2"
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
                            className="w-full border border-gray-300 rounded-md h-8 sm:h-10 xl:h-[26px] px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            type="button"
                            onClick={() => toggleVisibility("new")}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 xl:pr-2"
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
                            className="w-full border border-gray-300 rounded-md h-8 sm:h-10 xl:h-[26px] px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            type="button"
                            onClick={() => toggleVisibility("confirm")}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 xl:pr-2"
                        >
                            <img
                                src={showConfirm ? EyeOpenIcon : EyeCloseIcon}
                                alt={showConfirm ? "Hide password" : "Show password"}
                                className="w-4 h-4"
                            />
                        </button>
                    </div>

                    {/* Update Button - Better positioning */}
                    <div className="flex justify-end pt-2 xl:pt-1">
                        <CircleButton
                            text="Update"
                            color="bg-[#023184]"
                            onClick={handleUpdate}
                        />
                    </div>
                </div>
            </GradientCard>

            {/* Modal remains the same */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg text-center w-full max-w-sm sm:max-w-md xl:w-96">
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 14.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Passwords Don't Match</h3>
                                    <p className="text-sm text-gray-600">The new password and confirmation password do not match. Please check and try again.</p>
                                </>
                            )}

                            {modalType === 'emptyPassword' && (
                                <>
                                    <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 14.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Required</h3>
                                    <p className="text-sm text-gray-600">Please enter a new password.</p>
                                </>
                            )}
                        </div>
                        <button 
                            onClick={() => setShowModal(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}


import { CheckCircle, XCircle } from "lucide-react";

// RequestsSummaryCard component
function RequestsSummaryCard({ user }) {
    const [stats, setStats] = useState({
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (!user) return;
                const response = await apiService.getDashboardStats();
                if (response.success) {
                    setStats({
                        totalRequests: response.data.totalRequests || 0,
                        approvedRequests: response.data.approvedRequests || 0,
                        rejectedRequests: response.data.rejectedRequests || 0
                    });
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const { totalRequests, approvedRequests, rejectedRequests } = stats;

    return (
        <GradientCard className="rounded-[24px] h-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
            {/* Total Requests */}
            <div className="flex flex-col items-center mb-4 xl:mb-8">
                <h3 className="text-[#023184] font-semibold text-sm xl:text-base text-center max-w-[280px] mb-2">
                    Total Requests Reviewed This Year
                </h3>
                <div className="text-3xl xl:text-5xl font-bold text-gray-700 leading-none">
                    {loading ? '...' : totalRequests}
                </div>
            </div>

            {/* Divider */}
            <hr className="border-t border-gray-300 mb-3 xl:mb-4" />

            {/* Approved vs Rejected */}
            <div className="flex">
                <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1 xl:mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-[#023184] font-semibold text-sm">Approved</p>
                    </div>
                    <p className="text-2xl xl:text-3xl font-bold text-gray-700">{loading ? '...' : approvedRequests}</p>
                </div>

                <div className="w-px bg-gray-300 mx-3 xl:mx-4 self-stretch"></div>

                <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1 xl:mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <p className="text-[#023184] font-semibold text-sm">Rejected</p>
                    </div>
                    <p className="text-2xl xl:text-3xl font-bold text-gray-700">{loading ? '...' : rejectedRequests}</p>
                </div>
            </div>
        </GradientCard>
    );
}

// ActionLogCard component
function ActionLogCard({ user }) {
    const [recentActions, setRecentActions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivityLogs = async () => {
            try {
                if (!user?.id) return;
                const response = await apiService.getUserActivityLogs(user.id, 3);
                if (response.success) {
                    setRecentActions(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching activity logs:', error);
                // Fallback to empty array on error
                setRecentActions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchActivityLogs();
    }, [user]);

    if (loading) {
        return (
            <GradientCard className="rounded-[32px] h-full flex flex-col">
                <h3 className="text-[#023184] font-semibold mb-3 xl:mb-4 text-sm xl:text-base text-left">
                    Action Log: Last three (3) actions made
                </h3>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#023184]"></div>
                </div>
            </GradientCard>
        );
    }

    return (
        <GradientCard className="rounded-[32px] h-full flex flex-col">
            <h3 className="text-[#023184] font-semibold mb-3 xl:mb-4 text-sm xl:text-base text-left">
                Action Log: Last three (3) actions made
            </h3>

            <div className="space-y-2 xl:space-y-3 flex-1">
                {recentActions.length > 0 ? (
                    recentActions.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col xl:grid xl:grid-cols-5 gap-2 xl:gap-4 pb-2 xl:pb-3 border-b border-gray-200 last:border-b-0"
                        >
                            {/* Date column */}
                            <div className="xl:col-span-1 text-[#023184] font-medium text-sm text-left xl:border-r border-gray-300 xl:pr-4">
                                {new Date(item.created_at || item.date).toLocaleDateString()}
                            </div>

                            {/* Action column */}
                            <div className="xl:col-span-4 text-gray-700 text-sm leading-relaxed text-left xl:truncate xl:pl-2">
                                {item.action_description || item.action}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                        No recent actions found
                    </div>
                )}
            </div>
        </GradientCard>
    );
}

// NotesCard component
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 xl:mb-4 gap-2">
                <h3 className="text-[#023184] font-semibold text-sm xl:text-base text-left">
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
                className={`flex-1 w-full border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[100px] xl:min-h-0 ${
                    isEditing 
                        ? "border-gray-300 bg-white" 
                        : "border-gray-200 bg-gray-50 cursor-default"
                }`}
                style={{
                    fontSize: '14px',
                    lineHeight: '20px',
                    padding: '8px 12px',
                    paddingTop: '6px',
                    backgroundImage: isEditing
                        ? "repeating-linear-gradient(transparent 0px, transparent 18px, #e5e7eb 18px, #e5e7eb 19px)"
                        : "none",
                    backgroundSize: "100% 20px",
                    backgroundAttachment: "local",
                    backgroundPosition: "0 6px"
                }}
                value={isEditing ? tempNotes : notes}
                onChange={(e) => isEditing && setTempNotes(e.target.value)}
                readOnly={!isEditing}
                placeholder={isEditing ? "Write your notes..." : "No notes yet. Click Edit to add some."}
            />

            {isEditing && (
                <div className="flex gap-2 mt-3 xl:mt-4 justify-end">
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

function SummaryCard({ notes, setNotes, user }) {
    return (
        <GradientCard
            className="rounded-[64px] flex flex-col w-full xl:w-[788px] xl:h-[831px]"
            isMainCard={true}
        >
            <div className="text-left mb-4 sm:mb-6">
                <h2 className="text-[#023184] font-semibold text-base sm:text-lg mb-1">Summary</h2>
                <p className="text-gray-600 text-sm">Your activity overview in MetroExecuCare</p>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6 flex-1">
                <div className="flex-1">
                    <RequestsSummaryCard user={user} />
                </div>
                <div className="flex-1">
                    <ActionLogCard user={user} />
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
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [profile, setProfile] = useState(user);
    const [notes, setNotes] = useState("");

    // Update profile when user changes
    useEffect(() => {
        if (user) {
            setProfile(user);
        }
    }, [user]);

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleProfileClick = () => {
        // Already on profile page, do nothing
    };

    const handleLogout = async () => {
        await logout();
        navigate("/loginpage", { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBarMain
                user={user}
                onBackClick={handleBackClick}
                customProfileClick={handleProfileClick}
                customLogout={handleLogout}
                showBackButton={true}
                showProfileOption={true}
                showDropdown={true}
            />

            <div className="flex justify-center mt-6 sm:mt-8 xl:mt-[43px] px-4">
                <h1 className="text-[#023184] text-xl sm:text-2xl xl:text-[28px] font-bold">Profile</h1>
            </div>

            {/* Properly centered container */}
            <div className="flex justify-center py-4 sm:py-6 xl:py-8 px-4 sm:px-6">
                <div className="w-full max-w-sm sm:max-w-2xl xl:max-w-none">
                    <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8 xl:justify-center">
                        {/* Left Column */}
                        <div className="flex flex-col gap-4 sm:gap-6 xl:gap-8">
                            <ProfileCard profile={profile} setProfile={setProfile} />
                            <PasswordChangeCard user={user} />
                        </div>

                        {/* Right Column */}
                        <div>
                            <SummaryCard notes={notes} setNotes={setNotes} user={user} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}