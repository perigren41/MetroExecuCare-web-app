// src/pages/HRProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NavBarMain from "@/Components/NavBarMain";
import apiService from "@/services/api";
import EyeOpenIcon from "@/assets/eyeopen.svg";
import EyeCloseIcon from "@/assets/eyeclose.svg";
import CameraIcon from "@/assets/camera-svgrepo.svg";
import ProfileGray from "@/assets/profilegray.svg";
import AlertModal from "@/Components/AlertModal";
import ConfirmationModal from "@/Components/ConfirmationModal";
import { X } from "lucide-react";

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
            className={`${color} text-white px-4 py-2 rounded-full hover:opacity-80 transition`}
            onClick={onClick}
        >
            {text}
        </button>
    );
}

/* ---------------- ProfileCard ---------------- */
function ProfileCard({ profile, setProfile }) {
    const { updateUser, user } = useAuth();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isRemoving, setIsRemoving] = useState(false);
    const [showUploadConfirm, setShowUploadConfirm] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);

    // Helper function to convert profile picture path to full URL
    const getProfilePictureUrl = (picturePath) => {
        if (!picturePath) return ProfileGray;
        if (picturePath.startsWith('http')) return picturePath;
        if (picturePath.startsWith('data:')) return picturePath;
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
        return `${baseUrl}${picturePath}`;
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPendingFile(file);
            setShowUploadConfirm(true);
            // Reset file input
            e.target.value = '';
        }
    };

    const handleConfirmUpload = async () => {
        if (!pendingFile) return;

        try {
            setShowUploadConfirm(false);
            const response = await apiService.uploadProfilePicture(profile.id, pendingFile);
            if (response.success) {
                // Update profile with new picture path
                setProfile(prev => ({
                    ...prev,
                    profile_picture: response.data.profile_picture
                }));

                // Update AuthContext so NavBar reflects the change
                updateUser({
                    ...user,
                    profile_picture: response.data.profile_picture
                });

                setPendingFile(null);
                setSuccessMessage('Profile picture updated successfully!');
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to upload profile picture. Please try again.');
            setPendingFile(null);
        }
    };

    const handleCancelUpload = () => {
        setShowUploadConfirm(false);
        setPendingFile(null);
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

    // Helper function to get display name
    const getDisplayName = (profile) => {
        return `${profile.first_name} ${profile.last_name}`;
    };

    // Helper function to get default profile image
    const getProfileImage = (profile) => {
        if (profile.profile_picture) {
            return getProfilePictureUrl(profile.profile_picture);
        }
        // Return standard default profile image
        return ProfileGray;
    };

    return (
        <GradientCard className="rounded-[64px]" isMainCard={true}>
            <h2 className="text-blue-900 font-semibold mb-4 text-left text-base sm:text-lg">
                Basic Information
            </h2>

            <div className="flex flex-col lg:flex-row lg:justify-start items-center lg:items-start
            pb-4 gap-3 sm:gap-4 lg:gap-6">
                {/* Profile Image Section */}
                <div className="flex bg-black/20 backdrop-blur-sm flex-col items-center flex-shrink-0">
                    <input
                        type="file"
                        accept="image/*"
                        id="profileImageInput"
                        className="hidden"
                        onChange={handleImageSelect}
                    />

                    <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                        <img
                            src={getProfileImage(profile)}
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
                    <p className="text-blue-700 font-bold text-2xl sm:text-2xl">{getDisplayName(profile)}</p>
                    <p className="text-gray-600 text-sm sm:text-xs">{profile.position}</p>
                    <p className="text-gray-500 text-xs sm:text-xs mb-2">{profile.location || 'Not specified'}</p>

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

            {/* Upload Confirmation Modal */}
            <ConfirmationModal
                isOpen={showUploadConfirm}
                onClose={handleCancelUpload}
                onConfirm={handleConfirmUpload}
                title="Confirm Profile Picture Upload"
                message={`Are you sure you want to upload this picture as your profile picture?${pendingFile ? ` (${pendingFile.name})` : ''}`}
                confirmText="Upload"
                cancelText="Cancel"
                type="info"
            />

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

    const handleUpdate = async () => {
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setModalType("passwordMismatch");
            setShowModal(true);
            return;
        }

        // Validate fields are not empty
        if (!currentPassword || !newPassword.trim()) {
            setModalType("emptyPassword");
            setShowModal(true);
            return;
        }

        try {
            // Call the backend API to change password
            const response = await apiService.changePassword(currentPassword, newPassword);

            if (response.success) {
                // Clear password fields
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");

                // Show success modal
                setModalType("success");
                setShowModal(true);
            }
        } catch (error) {
            console.error('Password change error:', error);

            // Check if it's an incorrect password error
            if (error.response?.status === 400 || error.message.includes('incorrect')) {
                setModalType("wrongPassword");
            } else {
                setModalType("wrongPassword");
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                        <img
                        src={showCurrent ? EyeOpenIcon : EyeCloseIcon}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                        <img
                        src={showNew ? EyeOpenIcon : EyeCloseIcon}
                        alt={showNew ? "Hide password" : "Show password"}
                        className="w-5 h-5"
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
                            className="h-10 sm:h-12 w-full border border-gray-300 rounded-lg px-4 pr-12
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                        <img
                        src={showConfirm ? EyeOpenIcon : EyeCloseIcon}
                        alt={showConfirm ? "Hide password" : "Show password"}
                        className="w-5 h-5"
                        />
                        </button>
                    </div>

                    <div className="flex justify-end pt-2">
                        <CircleButton
                            text="Update"
                            color="bg-[#023184]"
                            onClick={handleUpdate}
                        />
                    </div>
                </div>
            </GradientCard>

            {/* Modals */}
            {showModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

                // Check if user is a workflow role (Human Resource, Benefits Officer, Division Head)
                const isWorkflowRole = ['hr_personnel', 'benefits_officer', 'welfare_head'].includes(user.role);

                if (isWorkflowRole) {
                    // Use the new user-specific stats endpoint
                    const response = await apiService.getUserActionStats();
                    if (response.success) {
                        setStats({
                            totalRequests: response.data.totalRequests || 0,
                            approvedRequests: response.data.approvedRequests || 0,
                            rejectedRequests: response.data.rejectedRequests || 0
                        });
                    }
                } else {
                    // For other roles, use the old dashboard stats
                    const response = await apiService.getDashboardStats();
                    if (response.success) {
                        setStats({
                            totalRequests: response.data.totalRequests || 0,
                            approvedRequests: response.data.approvedRequests || 0,
                            rejectedRequests: response.data.rejectedRequests || 0
                        });
                    }
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
        <GradientCard className="rounded-[24px]">
            {/* Total Requests */}
            <div className="flex flex-col items-center mb-2">
                <h3 className="text-blue-900 font-semibold text-xs sm:text-sm text-center mb-1">
                    Total Requests Reviewed This Year
                </h3>
                <div className="text-2xl sm:text-3xl font-bold text-gray-700 leading-none">
                    {loading ? '...' : totalRequests}
                </div>
            </div>

            {/* Divider */}
            <hr className="border-t border-gray-300 mb-2" />

            {/* Approved vs Rejected */}
            <div className="flex">
                <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <p className="text-blue-900 font-semibold text-xs sm:text-sm">Approved</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-700">{loading ? '...' : approvedRequests}</p>
                </div>

                <div className="w-px bg-gray-300 mx-2 sm:mx-3 self-stretch"></div>

                <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        <p className="text-blue-900 font-semibold text-xs sm:text-sm">Rejected</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-700">{loading ? '...' : rejectedRequests}</p>
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

                // Use the comprehensive activity logs endpoint for all users
                const response = await apiService.getUserActivityLogs(user.id, 10);
                if (response.success) {
                    const logs = response.data || [];
                    setRecentActions(logs);
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
            <GradientCard className="rounded-[24px]">
                <h3 className="text-xs sm:text-sm text-left mb-2">
                    <span className="text-blue-900 font-semibold">Action Log:</span> Recent actions
                </h3>
                <div className="flex-1 flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </GradientCard>
        );
    }

    return (
        <GradientCard className="rounded-[24px]">
            <h3 className="text-xs sm:text-sm text-left mb-3">
                <span className="text-blue-900 font-semibold">Action Log:</span> Your recent actions
            </h3>

            {recentActions.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                    No activity logs found
                </div>
            ) : (
                <>
                    {/* Desktop Table - 2 Column Layout */}
                    <div className="hidden sm:block overflow-x-auto">
                        <div className={recentActions.length > 5 ? "max-h-[200px] overflow-y-auto" : ""}>
                            <table className="w-full text-xs table-auto">
                                <thead className="bg-purple-300 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-center w-32">Date</th>
                                        <th className="p-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActions.map((item, idx) => (
                                        <tr key={idx} className="border-t hover:bg-gray-50">
                                            <td className="p-2 text-blue-600 whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
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
                        <div className={recentActions.length > 5 ? "max-h-[300px] overflow-y-auto space-y-2" : "space-y-2"}>
                            {recentActions.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
                                    <div className="text-blue-600 font-medium text-xs mb-2">
                                        {new Date(item.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-xs text-gray-700">
                                        {item.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {recentActions.length > 5 && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Scroll to view all {recentActions.length} actions
                            </p>
                        )}
                    </div>
                </>
            )}
        </GradientCard>
    );
}

// NotesCard component
function NotesCard({ notes, setNotes, user }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempNotes, setTempNotes] = useState(notes);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Update tempNotes when notes prop changes
    useEffect(() => {
        setTempNotes(notes);
    }, [notes]);

    const handleEdit = () => {
        setTempNotes(notes);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!user?.id) return;

        setSaving(true);
        try {
            // Save notes to database
            const response = await apiService.updateUserNotes(user.id, tempNotes);

            if (response.success) {
                setNotes(tempNotes);
                setIsEditing(false);
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            alert('Failed to save notes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTempNotes(notes);
        setIsEditing(false);
    };

    return (
        <>
            <GradientCard className="rounded-[24px] flex-1 flex flex-col">
                <h3 className="text-blue-900 text-xs sm:text-sm font-semibold mb-2 text-left">
                    Notes: Write down notes or reminders...
                </h3>
                <textarea
                    className={`w-full rounded-lg px-3 py-2 flex-1 resize-none border text-sm ${
                        isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[repeating-linear-gradient(white,white_23px,#e5e7eb_24px)]"
                            : "border-gray-200 bg-gray-50 cursor-default"
                    }`}
                    placeholder={isEditing ? "Write your notes here..." : "No notes yet. Click Edit to add some."}
                    value={isEditing ? tempNotes : notes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    readOnly={!isEditing}
                />
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
                                text={saving ? "Saving..." : "Save"}
                                color="bg-blue-600"
                                onClick={handleSave}
                            />
                            <CircleButton text="Cancel" color="bg-gray-400" onClick={handleCancel} />
                        </>
                    )}
                </div>
            </GradientCard>

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
                            onClick={() => {
                                setShowSuccessModal(false);
                                // Reload to refresh activity logs
                                window.location.reload();
                            }}
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

function SummaryCard({ notes, setNotes, user }) {
    return (
        <GradientCard className="rounded-[64px] h-full flex flex-col" isMainCard={true}>
            <div className="space-y-3 sm:space-y-4 flex-1 flex flex-col">
                <div className="text-left">
                    <h2 className="text-blue-900 font-semibold text-base sm:text-lg">Summary</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Your activity overview in MetroExecuCare</p>
                </div>

                <RequestsSummaryCard user={user} />
                <ActionLogCard user={user} />
                <NotesCard notes={notes} setNotes={setNotes} user={user} />
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

    // Load user notes from database
    useEffect(() => {
        const fetchNotes = async () => {
            if (!user?.id) return;

            try {
                const response = await apiService.getUserNotes(user.id);
                if (response.success && response.data?.notes) {
                    setNotes(response.data.notes);
                }
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        };

        fetchNotes();
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
        <div className="h-screen overflow-hidden bg-gray-50">
            <NavBarMain
                user={user}
                onBackClick={handleBackClick}
                customProfileClick={handleProfileClick}
                customLogout={handleLogout}
                showBackButton={true}
                showProfileOption={true}
                showDropdown={true}
            />

            <div className="flex justify-center mt-2 sm:mt-3 lg:mt-4 px-4">
                <h1 className="text-[#023184] text-lg sm:text-xl lg:text-2xl font-bold">Profile</h1>
            </div>

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
                            <SummaryCard notes={notes} setNotes={setNotes} user={user} />
                        </div>

                        {/* Mobile: Change Password */}
                        <div className="lg:hidden">
                            <PasswordChangeCard user={user} />
                        </div>

                        {/* Desktop: Left Column - Profile and Password Change */}
                        <div className="hidden lg:flex flex-col gap-3 lg:w-[420px] xl:w-[450px] self-stretch">
                            <ProfileCard profile={profile} setProfile={setProfile} />
                            <PasswordChangeCard user={user} />
                        </div>

                        {/* Desktop: Right Column - Summary */}
                        <div className="hidden lg:flex lg:w-[700px] xl:w-[750px] self-stretch h-full">
                            <SummaryCard notes={notes} setNotes={setNotes} user={user} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}