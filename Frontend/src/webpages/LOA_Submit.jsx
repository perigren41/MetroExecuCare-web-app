// LOA_Submit.jsx - Fully Responsive Version
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NavBarMain from "@/Components/NavBarMain";
import ExclamationPoint from "@/assets/ExclamationPoint.svg";
import UploadIcon from "@/assets/uploadicon.svg";
import { X, Search, Check, FileText, Edit3, Download } from "lucide-react";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";

// Import API service
import apiService from "@/services/api";
import FileRequestModal from "@/Components/FileRequestModal";
import PdfEditorModal from "@/Components/PdfEditorModal";
import PdfPreviewModal from "@/Components/PdfPreviewModal";

// Helper function to get the most recent staff file - moved outside component to avoid hoisting issues
const getMostRecentStaffFile = (user, request, pendingFiles) => {
    if (!request?.id) return { file: null, label: 'Staff File:', noFileMessage: 'No Staff File' };

    // Inline canApprove logic
    const userCanApprove = () => {
        if (!user || !request) return false;
        if (user.role === "hr_personnel") {
            return (request?.current_status === "hr_processing" || request?.current_status === "hr_final_verification")
                   && request?.assigned_hr_id === user.id;
        }
        if (user.role === "benefits_officer") {
            return request?.current_status === "benefits_review";
        }
        if (user.role === "welfare_head") {
            return request?.current_status === "welfare_review";
        }
        if (user.position === "Benefits Assistant" || user.username === "BA") {
            return request?.current_status === "hr_processing";
        }
        if (user.position === "Benefits Services Officer" || user.username === "BSO") {
            return request?.current_status === "benefits_review";
        }
        if (user.position === "Division Head" || user.username === "DivisionHead") {
            return request?.current_status === "welfare_review";
        }
        return false;
    };

    // Get all non-executive files (staff files) for THIS specific request from database
    const staffFiles = (request.files || []).filter(file => {
        if (file.uploaded_by === request.employee_id) return false;
        if (userCanApprove() && file.uploaded_by === user?.id) return false;
        if (request.current_status === 'hr_processing' || request.current_status === 'pending') {
            return false;
        }
        return file.request_id === request.id;
    });

    const allStaffFiles = [...staffFiles];

    console.log(`🔍 Debug - Request ID: ${request.id}, Employee ID: ${request.employee_id}`);
    console.log(`📁 Database files for request:`, request.files || []);
    console.log(`⏳ Pending files:`, pendingFiles);
    console.log(`👥 All staff files (database + pending):`, allStaffFiles);

    if (allStaffFiles.length === 0) {
        let label = 'Staff File:';
        switch (user?.role) {
            case 'hr_personnel':
                label = 'Human Resource File:';
                break;
            case 'benefits_officer':
                label = 'Benefits & Services File:';
                break;
            case 'welfare_head':
                label = 'Division Head File:';
                break;
            default:
                label = 'Staff File:';
        }

        let uploadMessage = 'No documents uploaded yet';
        switch (user?.role) {
            case 'hr_personnel':
                uploadMessage = 'No Human Resource documents';
                break;
            case 'benefits_officer':
                uploadMessage = 'No Benefits & Services documents';
                break;
            case 'welfare_head':
                uploadMessage = 'No Division Head documents';
                break;
            default:
                uploadMessage = 'No documents';
        }

        return { file: null, label: label, noFileMessage: uploadMessage };
    }

    const sortedStaffFiles = allStaffFiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`📄 Sorted staff files (most recent first):`, sortedStaffFiles.map(f => ({ name: f.original_file_name, created: f.created_at, uploaded_by: f.uploaded_by, isPending: f.isPending })));

    let fileLabel = 'Staff File:';
    let roleIdentifier = '';

    if (request.current_status === 'hr_processing' || request.current_status === 'pending') {
        fileLabel = 'Human Resource File:';
        roleIdentifier = 'Human Resource';
    } else if (request.current_status === 'benefits_review') {
        if (user?.role === 'benefits_officer') {
            fileLabel = 'Human Resource File:';
            roleIdentifier = 'Human Resource';
        } else {
            fileLabel = staffFiles.length > 1 ? 'Benefits & Services File:' : 'Human Resource File:';
            roleIdentifier = staffFiles.length > 1 ? 'Benefits & Services' : 'Human Resource';
        }
    } else if (request.current_status === 'welfare_review') {
        if (user?.role === 'welfare_head') {
            fileLabel = 'Benefits & Services File:';
            roleIdentifier = 'Benefits & Services';
        } else {
            fileLabel = staffFiles.length > 2 ? 'Welfare & Recreation File:' : 'Benefits & Services File:';
            roleIdentifier = staffFiles.length > 2 ? 'Welfare & Recreation' : 'Benefits & Services';
        }
    } else if (request.current_status === 'hr_final_verification') {
        if (user?.role === 'hr_personnel') {
            fileLabel = 'Welfare & Recreation File:';
            roleIdentifier = 'Welfare & Recreation';
        } else {
            fileLabel = staffFiles.length >= 3 ? 'Welfare & Recreation File:' : 'Benefits & Services File:';
            roleIdentifier = staffFiles.length >= 3 ? 'Welfare & Recreation' : 'Benefits & Services';
        }
    } else if (['approved', 'rejected', 'completed'].includes(request.current_status)) {
        if (staffFiles.length >= 3) {
            fileLabel = 'Welfare & Recreation File:';
            roleIdentifier = 'Welfare & Recreation';
        } else if (staffFiles.length >= 2) {
            fileLabel = 'Benefits & Services File:';
            roleIdentifier = 'Benefits & Services';
        } else {
            fileLabel = 'Human Resource File:';
            roleIdentifier = 'Human Resource';
        }
    }

    if (user?.role === 'benefits_officer' && request.current_status === 'benefits_review') {
        fileLabel = 'Human Resource File:';
        roleIdentifier = 'Human Resource';
    } else if (user?.role === 'welfare_head' && request.current_status === 'welfare_review') {
        fileLabel = 'Benefits & Services File:';
        roleIdentifier = 'Benefits & Services';
    } else if (user?.role === 'hr_personnel' && request.current_status === 'hr_final_verification') {
        fileLabel = 'Welfare & Recreation File:';
        roleIdentifier = 'Welfare & Recreation';
    }

    let selectedFile = null;

    if (request.current_status === 'hr_processing' || request.current_status === 'pending') {
        selectedFile = null;
    } else if (request.current_status === 'benefits_review') {
        selectedFile = sortedStaffFiles[0] || null;
    } else if (request.current_status === 'welfare_review') {
        selectedFile = sortedStaffFiles[0] || null;
    } else if (request.current_status === 'hr_final_verification') {
        selectedFile = sortedStaffFiles[0] || null;
    } else if (['approved', 'rejected', 'completed'].includes(request.current_status)) {
        selectedFile = sortedStaffFiles[0] || null;
    } else {
        selectedFile = sortedStaffFiles[0] || null;
    }

    console.log(`✅ Selected file for display:`, selectedFile ? { name: selectedFile.original_file_name, created: selectedFile.created_at, uploaded_by: selectedFile.uploaded_by } : 'None');
    console.log(`🏷️ File label: ${fileLabel}`);

    return {
        file: selectedFile,
        label: fileLabel,
        noFileMessage: `No ${roleIdentifier} File`
    };
};

export default function LOA_Submit() {
    const navigate = useNavigate();
    const { requestId } = useParams();
    const { user, logout } = useAuth();
    const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

    // State for request data
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for hospital forms
    const [hospitals, setHospitals] = useState([]);
    const [hospitalSearch, setHospitalSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedExistingHospital, setSelectedExistingHospital] = useState(null); // Track if user selected existing hospital

    // Form data for Letter of Approval
    const [approvalForm, setApprovalForm] = useState({
        hospital_id: "",
        checkup_date: "",
        letter_purpose: "",
        comments: ""
    });

    // Form data for Letter of Authorization
    const [authorizationForm, setAuthorizationForm] = useState({
        preferred_hospital: "",
        checkup_date: "",
        hospital_address: "",
        hospital_city: "",
        hospital_contact: "",
        reason_of_request: "",
        comments: ""
    });


    // Form validation errors
    const [formErrors, setFormErrors] = useState({});

    // PDF Editor state - MUST be defined before useEffect that uses it
    const [showPdfEditor, setShowPdfEditor] = useState(false);

    // Helper function to get user display name
    const getUserDisplayName = (user) => {
        if (!user) return "Loading...";
        return `${user.first_name} ${user.last_name}`;
    };

    // Helper function to get user initials
    const getUserInitials = (user) => {
        if (!user) return "?";
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    };

    // Fetch request data from API
    const fetchRequest = async () => {
        try {
            setLoading(true);
            const response = await apiService.getRequestById(requestId);

            if (response.success) {
                // Extract the nested request object
                const requestData = response.data.request || response.data;
                setRequest(requestData);
                // Clear newly uploaded file state since it's now in the main request data
                if (newlyUploadedFile && requestData.files && requestData.files.length > 0) {
                    const fileExists = requestData.files.some(file => file.id === newlyUploadedFile.id);
                    if (fileExists) {
                        setNewlyUploadedFile(null);
                    }
                }
            } else {
                setError('Request not found');
            }
        } catch (err) {
            setError('Failed to load request: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch accredited hospitals for dropdown
    const fetchAccreditedHospitals = async () => {
        try {
            const response = await apiService.getHospitals({ accredited: 'true' });
            if (response.success) {
                setHospitals(response.data);
            }
        } catch (error) {
            // Silently handle hospital fetch errors
        }
    };

    // Search hospitals for duplicate checking
    const searchHospitals = async (query) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            setIsSearching(true);
            const response = await apiService.searchHospitals(query.trim());
            if (response.success) {
                setSearchResults(response.data);
                setShowSearchResults(true);
            }
        } catch (error) {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle hospital search input with debouncing
    const handleHospitalSearch = (value) => {
        setHospitalSearch(value);
        setAuthorizationForm(prev => ({
            ...prev,
            preferred_hospital: value
        }));

        // Clear selected existing hospital when user types manually
        setSelectedExistingHospital(null);

        // Clear form errors when user starts typing
        if (formErrors.preferred_hospital) {
            setFormErrors(prev => ({ ...prev, preferred_hospital: '' }));
        }

        // Clear previous timeout
        if (window.hospitalSearchTimeout) {
            clearTimeout(window.hospitalSearchTimeout);
        }

        // Debounce search
        window.hospitalSearchTimeout = setTimeout(() => {
            searchHospitals(value);
        }, 300);
    };

    // Validate forms
    const validateApprovalForm = () => {
        const errors = {};
        if (!approvalForm.hospital_id) errors.hospital_id = 'Hospital selection is required';
        if (!approvalForm.checkup_date) errors.checkup_date = 'Checkup date is required';
        if (!approvalForm.letter_purpose.trim()) errors.letter_purpose = 'Reason for request is required';
        return errors;
    };

    const validateAuthorizationForm = () => {
        const errors = {};
        if (!authorizationForm.preferred_hospital.trim()) errors.preferred_hospital = 'Preferred hospital is required';
        if (!authorizationForm.checkup_date) errors.checkup_date = 'Preferred date of checkup is required';
        if (!authorizationForm.hospital_address.trim()) errors.hospital_address = 'Address of preferred hospital is required';
        if (!authorizationForm.hospital_city.trim()) errors.hospital_city = 'City of hospital is required';
        if (!authorizationForm.hospital_contact.trim()) errors.hospital_contact = 'Contact of preferred hospital is required';
        if (!authorizationForm.reason_of_request.trim()) errors.reason_of_request = 'Reason of request is required';
        return errors;
    };


    // Load request data on component mount
    useEffect(() => {
        if (user && requestId) {
            fetchRequest();
            fetchAccreditedHospitals();
        }
    }, [user, requestId]);

    // Auto-refresh request data every 30 seconds for real-time updates
    // DISABLED when PDF editor is open to prevent losing user's work
    useEffect(() => {
        if (!user || !requestId) return;
        if (showPdfEditor) return; // Don't refresh while user is editing PDF

        const interval = setInterval(() => {
            fetchRequest();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [user, requestId, showPdfEditor]);

    // State for modal/confirmation dialogs
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showReleaseModal, setShowReleaseModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFileRequestModal, setShowFileRequestModal] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [approvalComment, setApprovalComment] = useState("");
    const [releaseReason, setReleaseReason] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [tempFile, setTempFile] = useState(null);
    const [newlyUploadedFile, setNewlyUploadedFile] = useState(null);
    const [pendingFiles, setPendingFiles] = useState([]); // Store files temporarily until approval/rejection
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modern modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [fileToRemove, setFileToRemove] = useState(null);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#023184] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading request details...</p>
                    <p className="text-sm text-gray-500 mt-2">Request ID: {requestId}</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error || !request) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                        Request Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error || 'The requested record could not be found.'}
                    </p>
                    <button
                        onClick={() => navigate("/hr-pending-requests", { state: { user } })}
                        className="px-6 py-2 bg-[#023184] text-white rounded-lg hover:bg-[#034299] transition-colors"
                    >
                        Go Back to Pending Requests
                    </button>
                </div>
            </div>
        );
    }

    // Format request type for display
    const formatRequestType = (type) => {
        if (!type) return "Loading...";
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Format status for display
    const formatStatus = (status) => {
        if (!status) return "Loading...";

        // Handle special status names
        const statusMap = {
            'hr_final_verification': 'Executive Clearance Review',
            'hr_processing': 'Human Resource Processing',
            'benefits_review': 'Benefits Officer Review',
            'welfare_review': 'Division Head Review'
        };

        if (statusMap[status]) {
            return statusMap[status];
        }

        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())
            .replace(/\bBa\b/g, "BA")
            .replace(/\bBso\b/g, "BSO");
    };

    // Get status color
    const getStatusColor = (status) => {
        if (!status) return "text-gray-600";
        switch (status) {
            case "pending review":
                return "text-yellow-600";
            case "pending ba approval":
                return "text-blue-600";
            case "pending bso approval":
                return "text-purple-600";
            case "pending division head approval":
                return "text-orange-600";
            case "hr_processing":
                return "text-blue-600";
            case "benefits_review":
                return "text-purple-600";
            case "welfare_review":
                return "text-orange-600";
            case "hr_final_verification":
                return "text-indigo-600";
            case "approved":
                return "text-green-600";
            case "completed":
                return "text-green-600";
            case "rejected":
                return "text-red-600";
            case "for return":
                return "text-gray-600";
            default:
                return "text-gray-600";
        }
    };

    const handleLogout = () => {
        // Clear session data
        sessionStorage.removeItem("user");
        sessionStorage.clear();
        localStorage.removeItem('authToken');
        navigate("/login", { replace: true });
    };

    // Action handlers
    const handleApprove = () => {
        setShowApproveModal(true);
    };

    const handleReject = () => {
        setShowRejectModal(true);
    };

    const handleRelease = () => {
        setShowReleaseModal(true);
    };

    const confirmRelease = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const releaseData = {
                reason: releaseReason.trim() || null
            };

            const response = await apiService.releaseRequest(requestId, releaseData);

            if (response.success) {
                alert(`Request released successfully! ${response.message || 'The request is now available for other HR personnel to claim.'}`);
                setShowReleaseModal(false);
                setReleaseReason("");
                // Redirect to HR dashboard
                navigate('/hr-dashboard', { state: { user } });
            } else {
                alert(`Failed to release request: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error releasing request:', error);
            alert(`Error releasing request: ${error.message || 'Please try again'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReturn = () => {
        // Redirect to appropriate dashboard based on user role
        const dashboardRoute = getDashboardRoute();
        navigate(dashboardRoute, { state: { user } });
    };

    const confirmApprove = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Validate form data based on request type and user role
            let formErrors = {};
            let approvalData = {
                action: 'approve',
                comments: approvalComment.trim() || null,
                assigned_hospital_id: null,
                approved_date: null
            };

            // Only HR Personnel need to fill forms - Benefits Officers and Welfare Heads can approve directly
            // BUT during hr_final_verification, HR only reviews and doesn't need to fill forms
            if ((user?.role === 'hr_personnel' || user?.role === 'admin') && request?.current_status !== 'hr_final_verification') {
                if (request?.request_type === 'letter_of_approval') {
                    formErrors = validateApprovalForm();
                    if (Object.keys(formErrors).length === 0) {
                        approvalData.assigned_hospital_id = parseInt(approvalForm.hospital_id);
                        approvalData.approved_date = approvalForm.checkup_date;
                        if (approvalForm.comments.trim()) {
                            approvalData.comments = approvalForm.comments.trim();
                        }
                    }
                } else if (request?.request_type === 'letter_of_authorization') {
                    formErrors = validateAuthorizationForm();
                    if (Object.keys(formErrors).length === 0) {
                        // Check if user selected an existing hospital from dropdown
                        if (selectedExistingHospital) {
                            // Use existing hospital
                            console.log('🏥 Using existing hospital:', selectedExistingHospital);
                            approvalData.assigned_hospital_id = selectedExistingHospital.id;
                        } else {
                            // Create new hospital
                            const hospitalData = {
                                name: authorizationForm.preferred_hospital.trim(),
                                address: authorizationForm.hospital_address.trim(),
                                city: authorizationForm.hospital_city.trim(),
                                contact_number: authorizationForm.hospital_contact.trim(),
                                reason_of_request: authorizationForm.reason_of_request.trim()
                            };

                            console.log('🏥 Creating new hospital with data:', hospitalData);
                            console.log('📋 Authorization form data:', authorizationForm);

                            const hospitalResponse = await apiService.createHospital(hospitalData);
                            if (!hospitalResponse.success) {
                                setErrorMessage('Failed to register hospital: ' + (hospitalResponse.message || 'Unknown error'));
                                setShowErrorModal(true);
                                return;
                            }

                            approvalData.assigned_hospital_id = hospitalResponse.data.id;
                        }

                        approvalData.approved_date = authorizationForm.checkup_date;
                        if (authorizationForm.comments.trim()) {
                            approvalData.comments = authorizationForm.comments.trim();
                        }
                    }
                }
            }
            // Benefits Officers and Welfare Heads skip form validation entirely

            if (Object.keys(formErrors).length > 0) {
                setFormErrors(formErrors);
                setErrorMessage('Please fill in all required fields');
                setShowErrorModal(true);
                return;
            }

            // Check if file upload is required for HR, Benefits Officers, and Welfare Heads
            if (['hr_personnel', 'benefits_officer', 'welfare_head'].includes(user?.role)) {
                // Get staff files (non-executive files) for this request from current user
                const currentUserFiles = (request?.files || []).filter(file =>
                    file.uploaded_by === user?.id &&
                    file.request_id === request?.id
                );

                if (!currentUserFiles || currentUserFiles.length === 0) {
                    setErrorMessage('File upload is required before approval. Please upload a file first.');
                    setShowErrorModal(true);
                    return;
                }
            }

            console.log('🚀 Sending approval data to backend:', approvalData);
            let response;

            // HR Personnel use the /process endpoint for initial processing, /approve for final verification
            if (user?.role === 'hr_personnel' && request?.current_status !== 'hr_final_verification') {
                // Validate request can be processed (only for initial HR processing)
                if (!['assigned_to_hr', 'hr_processing'].includes(request?.current_status)) {
                    setErrorMessage(`Request cannot be processed. Current status: ${request?.current_status}. Expected: assigned_to_hr or hr_processing.`);
                    setShowErrorModal(true);
                    return;
                }

                if (request?.assigned_hr_id !== user?.id) {
                    setErrorMessage('You can only process requests assigned to you.');
                    setShowErrorModal(true);
                    return;
                }

                // Transform data for processRequest endpoint
                const processData = {
                    comments: approvalData.comments,
                    hr_assigned_hospital_id: approvalData.assigned_hospital_id,
                    approved_date: approvalData.approved_date
                };

                // For Letter of Authorization, include hospital details
                if (request?.request_type === 'letter_of_authorization') {
                    processData.hospital_name = authorizationForm.preferred_hospital.trim();
                    processData.hospital_address = authorizationForm.hospital_address.trim();
                    processData.hospital_contact = authorizationForm.hospital_contact.trim();
                    processData.letter_purpose = authorizationForm.reason_of_request.trim();

                    // If using existing hospital, pass the ID
                    if (approvalData.assigned_hospital_id) {
                        processData.existing_hospital_id = approvalData.assigned_hospital_id;
                    }
                }
                // For Letter of Approval, include hospital_id and letter_purpose
                else if (request?.request_type === 'letter_of_approval') {
                    processData.hospital_id = parseInt(approvalForm.hospital_id);
                    processData.letter_purpose = approvalForm.letter_purpose.trim();
                }

                console.log('🔄 HR Processing data:', processData);
                console.log('📋 Current request status:', request?.current_status);
                console.log('👤 Current user role:', user?.role);
                console.log('🔗 Request assigned to HR ID:', request?.assigned_hr_id);
                console.log('👤 Current user ID:', user?.id);

                response = await apiService.processRequest(requestId, processData);
            } else {
                // Benefits Officers and Welfare Heads use approve endpoint
                response = await apiService.approveRequest(requestId, approvalData);
            }

            if (response.success) {
                console.log('✅ Request approved successfully');

                setShowApproveModal(false);
                setApprovalComment("");
                setFormErrors({});
                setSuccessMessage('Request approved successfully! Email notifications have been sent.');
                setShowSuccessModal(true);

                // Redirect to appropriate dashboard based on user role after a delay
                setTimeout(() => {
                    const dashboardRoute = getDashboardRoute();
                    navigate(dashboardRoute, { state: { user } });
                }, 2000);
            } else {
                console.error('❌ Request processing failed:', response);
                // Display specific validation errors if available
                let errorMsg = 'Failed to approve request: ';
                if (response.details && Array.isArray(response.details) && response.details.length > 0) {
                    errorMsg += '\n\n' + response.details.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
                } else {
                    errorMsg += (response.error || response.message || 'Unknown error');
                }
                setErrorMessage(errorMsg);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('❌ Request processing error:', error);
            setErrorMessage('Failed to approve request: ' + error.message);
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmReject = async () => {
        if (!rejectionReason.trim()) {
            setErrorMessage("Please provide a reason for rejection");
            setShowErrorModal(true);
            return;
        }

        // Note: File upload is NOT required for rejection
        // Rejection can happen without uploading files

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const response = await apiService.rejectRequest(requestId, {
                action: 'reject',
                comments: rejectionReason.trim()
            });

            if (response.success) {
                console.log('✅ Request rejected successfully');

                setShowRejectModal(false);
                setRejectionReason("");
                setSuccessMessage('Request rejected successfully! Email notification has been sent.');
                setShowSuccessModal(true);

                // Redirect to appropriate dashboard based on user role after a delay
                setTimeout(() => {
                    const dashboardRoute = getDashboardRoute();
                    navigate(dashboardRoute, { state: { user } });
                }, 2000);
            } else {
                // Display specific validation errors if available
                let errorMsg = 'Failed to reject request: ';
                if (response.details && Array.isArray(response.details) && response.details.length > 0) {
                    errorMsg += '\n\n' + response.details.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
                } else {
                    errorMsg += (response.error || response.message || 'Unknown error');
                }
                setErrorMessage(errorMsg);
                setShowErrorModal(true);
            }
        } catch (error) {
            setErrorMessage('Failed to reject request: ' + error.message);
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmReturn = () => {
        // Redirect to appropriate dashboard based on user role
        const dashboardRoute = getDashboardRoute();
        navigate(dashboardRoute, { state: { user } });
    };

    const handleDownload = async (fileId, filename) => {
        try {
            const response = await apiService.downloadRequestFile(requestId, fileId);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setErrorMessage('Failed to download file: ' + error.message);
            setShowErrorModal(true);
        }
    };

    const handleDeleteFile = (fileId, filename) => {
        setFileToRemove({ id: fileId, original_file_name: filename });
        setShowConfirmRemoveModal(true);
    };

    const confirmRemoveFile = async () => {
        if (!fileToRemove) return;

        try {
            const response = await apiService.deleteRequestFile(requestId, fileToRemove.id);
            if (response.success) {
                setSuccessMessage('File removed successfully!');
                setShowSuccessModal(true);
                // Clear newly uploaded file if it matches
                if (newlyUploadedFile && newlyUploadedFile.id === fileToRemove.id) {
                    setNewlyUploadedFile(null);
                }
                // Refresh request data to update file list
                fetchRequest();
            } else {
                setErrorMessage('Failed to delete file: ' + (response.message || 'Unknown error'));
                setShowErrorModal(true);
            }
        } catch (error) {
            setErrorMessage('Failed to delete file: ' + error.message);
            setShowErrorModal(true);
        } finally {
            setShowConfirmRemoveModal(false);
            setFileToRemove(null);
        }
    };

    const removeNewlyUploadedFile = () => {
        if (!newlyUploadedFile) return;

        // If it's a pending file (not yet saved to database), just remove from state
        if (newlyUploadedFile.isPending) {
            setPendingFiles(prev => prev.filter(file => file.id !== newlyUploadedFile.id));
            setNewlyUploadedFile(null);
            setSuccessMessage('File removed successfully!');
            setShowSuccessModal(true);
        } else {
            // If it's already saved to database, use the normal deletion process
            setFileToRemove(newlyUploadedFile);
            setShowConfirmRemoveModal(true);
        }
    };


    const cancelRemoveFile = () => {
        setShowConfirmRemoveModal(false);
        setFileToRemove(null);
    };

    // Upload modal handlers
    const handleUpload = () => {
        setShowUploadModal(true);
    };

    const closeUploadModal = () => {
        setShowUploadModal(false);
        setTempFile(null);
        setIsDragOver(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            validateAndSetFile(file);
        }
    };

    const handleUploadAreaClick = () => {
        document.getElementById('fileInput').click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file) => {
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage('File size must be less than 10MB');
            setShowErrorModal(true);
            return;
        }

        // Check file type - only allow PDF for this upload modal
        if (file.type !== 'application/pdf') {
            setErrorMessage('Please upload only PDF files');
            setShowErrorModal(true);
            return;
        }

        setTempFile(file);
    };

    const handleFinalUpload = async () => {
        if (!tempFile) {
            setErrorMessage('Please select a file first');
            setShowErrorModal(true);
            return;
        }

        try {
            // Upload file immediately to database for workflow visibility
            console.log('📤 Uploading file immediately for workflow visibility...');
            const uploadResult = await apiService.uploadRequestFile(requestId, tempFile);

            if (uploadResult.success) {
                console.log('✅ File uploaded successfully to database:', uploadResult);

                // Set the newly uploaded file to show confirmation
                const uploadedFileInfo = {
                    id: uploadResult.data?.file_id || uploadResult.data?.id,
                    original_file_name: tempFile.name,
                    file_path: uploadResult.data?.file_path || '',
                    uploaded_by: user?.id,
                    isPending: false,
                    created_at: new Date().toISOString()
                };
                setNewlyUploadedFile(uploadedFileInfo);

                // Refresh request data to show the new file
                await fetchRequest();

                setSuccessMessage(`File "${tempFile.name}" uploaded successfully!`);
                setShowSuccessModal(true);
                closeUploadModal();
            } else {
                setErrorMessage('Failed to upload file: ' + (uploadResult.message || 'Unknown error'));
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('❌ File upload error:', error);
            setErrorMessage('Failed to upload file: ' + error.message);
            setShowErrorModal(true);
        }
    };

    // Handle PDF editor save
    const handlePdfEditorSave = async (file) => {
        try {
            console.log('📤 Uploading filled PDF from editor...');
            const uploadResult = await apiService.uploadRequestFile(requestId, file);

            if (uploadResult.success) {
                console.log('✅ Filled PDF uploaded successfully:', uploadResult);

                // Set the newly uploaded file to show confirmation
                const uploadedFileInfo = {
                    id: uploadResult.data?.file_id || uploadResult.data?.id,
                    original_file_name: file.name,
                    file_path: uploadResult.data?.file_path || '',
                    uploaded_by: user?.id,
                    isPending: false,
                    created_at: new Date().toISOString()
                };
                setNewlyUploadedFile(uploadedFileInfo);

                // Refresh request data to show the new file
                await fetchRequest();

                setSuccessMessage(`File "${file.name}" uploaded successfully!`);
                setShowSuccessModal(true);
                setShowPdfEditor(false);
            } else {
                setErrorMessage('Failed to upload file: ' + (uploadResult.message || 'Unknown error'));
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('❌ PDF upload error:', error);
            setErrorMessage('Failed to upload file: ' + error.message);
            setShowErrorModal(true);
        }
    };

    // Check if user can take actions on this request
    const canApprove = () => {
        if (!user || !request) return false;

        // HR Personnel can approve when status is 'hr_processing' OR 'hr_final_verification' and they are assigned
        if (user.role === "hr_personnel") {
            return (request?.current_status === "hr_processing" || request?.current_status === "hr_final_verification")
                   && request?.assigned_hr_id === user.id;
        }

        // Benefits Officer can approve when status is 'benefits_review'
        if (user.role === "benefits_officer") {
            return request?.current_status === "benefits_review";
        }

        // Welfare Head can approve when status is 'welfare_review'
        if (user.role === "welfare_head") {
            return request?.current_status === "welfare_review";
        }

        // For testing purposes, also allow old position names
        if (user.position === "Benefits Assistant" || user.username === "BA") {
            return request?.current_status === "hr_processing";
        }
        if (user.position === "Benefits Services Officer" || user.username === "BSO") {
            return request?.current_status === "benefits_review";
        }
        if (user.position === "Division Head" || user.username === "DivisionHead") {
            return request?.current_status === "welfare_review";
        }

        return false;
    };

    // Check if user can see the Return button (only BAs can see "for return" requests)
    const canShowReturn = () => {
        if (!user || !request) return false;
        return (user.position === "Benefits Assistant" || user.position === "hr_personnel" || user.username === "BA") &&
            request?.current_status === "for return";
    };

    // Helper function to determine dashboard route based on user role
    const getDashboardRoute = () => {
        switch (user?.role) {
            case 'executive':
                return '/executive-employee-dashboard';
            case 'hr_personnel':
                return '/hr-dashboard';
            case 'benefits_officer':
                return '/benefits-dashboard';
            case 'welfare_head':
                return '/welfare-dashboard';
            case 'admin':
                return '/hr-dashboard'; // Admin uses HR dashboard
            default:
                return '/hr-dashboard'; // Default fallback
        }
    };

    // Helper function to determine if HR Processing section should be shown
    const shouldShowHRProcessing = () => {
        return user?.role === 'hr_personnel' || user?.role === 'admin';
    };

    // Helper function to get the correct approval document name based on request type
    const getApprovalDocumentName = () => {
        if (!request) return 'signed document';

        if (request.request_type === 'letter_of_authorization') {
            return 'Approval Letter of Authorization For Annual Medical Check-up Laboratory and Procedures';
        } else if (request.request_type === 'letter_of_approval') {
            return 'Approval For Annual Medical Check-up';
        }
        return 'signed document';
    };

    // Helper function to get the PDF URL for Fill & Sign (progressive signing workflow)
    const getPdfUrlForFillAndSign = () => {
        if (!request) return null;

        // Get all staff files (excluding executive files)
        const staffFiles = (request.files || []).filter(file =>
            file.uploaded_by !== request.employee_id
        );

        // Sort by creation date (most recent first) to get the latest signed version
        const sortedStaffFiles = staffFiles.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        // If there's a staff file, use it (this will be the most recently signed version)
        if (sortedStaffFiles.length > 0) {
            const mostRecentFile = sortedStaffFiles[0];
            // file_path from database already includes 'request-files/' prefix
            // Just use file_name to construct the correct path
            return `${BACKEND_BASE_URL}/uploads/request-files/${mostRecentFile.file_name}`;
        }

        // Otherwise, use the template (for HR's first signature)
        const templatePath = request.request_type === 'letter_of_authorization'
            ? 'Approval Letter of Authorization For Annual Medical Check-up Laboratory and Procedures.pdf'
            : 'Approval For Annual Medical Check-up.pdf';
        return `${BACKEND_BASE_URL}/templates/documents/${templatePath}`;
    };

    // Helper function to check if Fill & Sign button should be shown
    const shouldShowFillAndSign = () => {
        if (!user || !request) return false;

        // Hide Fill & Sign during HR final verification
        if (request.current_status === 'hr_final_verification') {
            return false;
        }

        // Show Fill & Sign for approvers during their review stage
        // Inline the canApprove logic to avoid hoisting issues
        if (user.role === "hr_personnel") {
            return (request.current_status === "hr_processing" || request.current_status === "hr_final_verification")
                   && request.assigned_hr_id === user.id;
        }
        if (user.role === "benefits_officer") {
            return request.current_status === "benefits_review";
        }
        if (user.role === "welfare_head") {
            return request.current_status === "welfare_review";
        }

        return false;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Updated Navbar with proper user display */}
            <NavBarMain
                user={{
                    ...user,
                    name: getUserDisplayName(user)
                }}
                onLogout={handleLogout}
                showHomeButton={true}
                backButtonIcon={BackSquareIconWhite}
                customBackHandler={() => {
                    // Navigate to appropriate dashboard based on role
                    if (user?.role === "hr_personnel") {
                        navigate("/hr-pending-requests", { state: { user } });
                    } else if (user?.role === "benefits_officer" || user?.role === "welfare_head") {
                        navigate("/hr-dashboard", { state: { user } });
                    } else {
                        navigate(-1); // Fallback to browser back
                    }
                }}
            />

            {/* Page Title - Responsive */}
            <div className="flex justify-center mt-4 md:mt-8 lg:mt-[43px] px-4">
                <h1 className="text-[#023184] text-xl sm:text-2xl md:text-[28px] font-bold text-center">
                    {formatRequestType(request.request_type)}
                </h1>
            </div>

            {/* Main Content Container - Responsive */}
            <div className="px-4 sm:px-8 md:px-16 lg:px-32 xl:px-[200px] mt-4 md:mt-8 pb-8">
                <div className="bg-white rounded-2xl md:rounded-[32px] shadow-lg border-2 md:border-4 border-transparent"
                    style={{
                        background: "linear-gradient(white, white) padding-box, linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8) border-box"
                    }}>

                    {/* Details Section - Responsive */}
                    <div className="p-4 sm:p-6 md:p-8">
                        <h2 className="text-[#023184] text-lg sm:text-xl md:text-[24px] font-bold mb-4 md:mb-6 text-center">Details</h2>

                        {/* Responsive Grid Layout - 3 columns for HR, 2 columns for Benefits/Welfare */}
                        <div className={`grid grid-cols-1 gap-6 lg:gap-8 ${shouldShowHRProcessing() ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'}`}>
                            {/* Column 1 - Request Info */}
                            <div className="space-y-3 sm:space-y-4 order-2 md:order-1">
                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Request Number:</label>
                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">{request?.request_number || request?.id}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Type:</label>
                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{formatRequestType(request.request_type)}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Requested on:</label>
                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
                                        {request?.created_at ? new Date(request.created_at).toLocaleDateString('en-US') : "Loading..."}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Requested by:</label>
                                    <p className="text-gray-700 text-sm sm:text-base">
                                        {`${request?.first_name || 'Unknown'} ${request?.last_name || 'User'}`}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Employee ID:</label>
                                    <p className="text-gray-700 text-sm sm:text-base">
                                        {request?.employee_number || request?.employee_id || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Department:</label>
                                    <p className="text-gray-700 text-sm sm:text-base">
                                        {request?.department || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Current status:</label>
                                    <div className="text-gray-700 text-sm sm:text-base">
                                        <p className={`text-sm sm:text-base font-semibold ${getStatusColor(request?.current_status)}`}>
                                            {formatStatus(request?.current_status)}
                                        </p>
                                        {['hr_processing', 'benefits_review', 'welfare_review', 'hr_final_verification'].includes(request?.current_status) && (
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="In Progress"></div>
                                        )}
                                        {request?.current_status === 'approved' && (
                                            <div className="w-2 h-2 bg-green-400 rounded-full" title="Completed"></div>
                                        )}
                                        {request?.current_status === 'rejected' && (
                                            <div className="w-2 h-2 bg-red-400 rounded-full" title="Rejected"></div>
                                        )}
                                    </div>
                                </div>


                            </div>

                            {/* Column 2 - HR Processing Forms (Only shown for HR Personnel and Admin) */}
                            {shouldShowHRProcessing() && (
                            <div className="space-y-3 sm:space-y-4 order-3 md:order-2 xl:order-2">
                                {request && (
                                    <>
                                        <div className="mb-4">
                                            <h3 className="text-[#023184] font-bold mb-3 text-sm sm:text-base">
                                                {(request?.current_status === 'hr_final_verification' ||
                                                  (user?.role === 'hr_personnel' && ['benefits_review', 'welfare_review'].includes(request?.current_status)))
                                                    ? 'Human Resource Processed Information:'
                                                    : 'Human Resource Processing Information:'}
                                            </h3>
                                        </div>

                                        {(request?.current_status === 'hr_final_verification' ||
                                          (user?.role === 'hr_personnel' && ['benefits_review', 'welfare_review'].includes(request?.current_status))) ? (
                                            /* Read-only display when HR has already processed or during final verification */
                                            <>
                                                {request?.request_type === 'letter_of_approval' ? (
                                                    <>
                                                        <div>
                                                            <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Hospital Name:</label>
                                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{request?.hr_assigned_hospital_name || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Checkup Date:</label>
                                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
                                                                {request?.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : 'Not set'}
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Preferred Hospital:</label>
                                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{request?.hr_assigned_hospital_name || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Hospital Address:</label>
                                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{request?.hr_assigned_hospital_address || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Hospital Contact:</label>
                                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{request?.hr_assigned_hospital_contact || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Checkup Date:</label>
                                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
                                                                {request?.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : 'Not set'}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Reason for Request:</label>
                                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{request?.letter_purpose || 'Not specified'}</p>
                                                </div>
                                            </>
                                        ) : request?.request_type === 'letter_of_approval' ? (
                                            /* Editable form during initial processing */
                                            <>
                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Hospital Name: <span className="text-red-500">*</span></label>
                                                    <select
                                                        className="w-full p-2 border border-gray-300 rounded text-black text-sm focus:outline-none focus:border-[#023184] transition-colors"
                                                        value={approvalForm.hospital_id}
                                                        onChange={(e) => setApprovalForm({...approvalForm, hospital_id: e.target.value})}
                                                    >
                                                        <option value="">Select Hospital</option>
                                                        {hospitals.map((hospital) => (
                                                            <option key={hospital.id} value={hospital.id}>
                                                                {hospital.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {formErrors.hospital_id && <span className="text-red-500 text-xs">{formErrors.hospital_id}</span>}
                                                </div>

                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Checkup Date: <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="date"
                                                        className="w-full p-2 border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-[#023184] transition-colors"
                                                        value={approvalForm.checkup_date}
                                                        onChange={(e) => setApprovalForm({...approvalForm, checkup_date: e.target.value})}
                                                    />
                                                    {formErrors.checkup_date && <span className="text-red-500 text-xs">{formErrors.checkup_date}</span>}
                                                </div>

                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Reason for Request: <span className="text-red-500">*</span></label>
                                                    <textarea
                                                        className="w-full p-2 border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-[#023184] transition-colors resize-none"
                                                        rows={2}
                                                        value={approvalForm.letter_purpose}
                                                        onChange={(e) => setApprovalForm({...approvalForm, letter_purpose: e.target.value})}
                                                        placeholder="Reason for requesting this checkup"
                                                    />
                                                    {formErrors.letter_purpose && <span className="text-red-500 text-xs">{formErrors.letter_purpose}</span>}
                                                </div>
                                            </>
                                        ) : request?.request_type === 'letter_of_authorization' ? (
                                            /* Letter of Authorization Form */
                                            <>
                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Preferred Hospital: <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            className="w-full p-2 pr-8 border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-[#023184] transition-colors"
                                                            value={authorizationForm.preferred_hospital}
                                                            onChange={(e) => handleHospitalSearch(e.target.value)}
                                                            placeholder="Search or enter hospital name"
                                                            onFocus={() => setShowSearchResults(searchResults.length > 0)}
                                                            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                                                        />
                                                        <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                                                        {isSearching && (
                                                            <div className="absolute right-8 top-2.5">
                                                                <div className="animate-spin h-4 w-4 border-2 border-[#023184] border-t-transparent rounded-full"></div>
                                                            </div>
                                                        )}

                                                        {/* Search Results Dropdown - Positioned relative to input */}
                                                        {showSearchResults && searchResults.length > 0 && (
                                                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto">
                                                                {searchResults.map((hospital) => (
                                                                    <div
                                                                        key={hospital.id}
                                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b text-gray-700 border-gray-100 last:border-b-0 transition-colors"
                                                                        onClick={() => {
                                                                            setAuthorizationForm({
                                                                                ...authorizationForm,
                                                                                preferred_hospital: hospital.name,
                                                                                hospital_address: hospital.address || '',
                                                                                hospital_city: hospital.city || '',
                                                                                hospital_contact: hospital.contact_number || ''
                                                                            });
                                                                            setSelectedExistingHospital(hospital); // Mark as selected from existing
                                                                            setShowSearchResults(false);
                                                                            setSearchResults([]); // Clear search results to remove duplicate warning

                                                                            // Clear any form errors
                                                                            if (formErrors.preferred_hospital) {
                                                                                setFormErrors(prev => ({ ...prev, preferred_hospital: '' }));
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {hospital.city} • {hospital.accredited ? 'Accredited' : 'Non-accredited'}
                                                                        </div>
                                                                        {hospital.address && (
                                                                            <div className="text-xs text-gray-400 truncate">{hospital.address}</div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {formErrors.preferred_hospital && <span className="text-red-500 text-xs mt-1 block">{formErrors.preferred_hospital}</span>}

                                                    {/* Smart Duplicate Warning - Only show if there are exact or partial matches */}
                                                    {searchResults.length > 0 &&
                                                     authorizationForm.preferred_hospital.length > 2 &&
                                                     !searchResults.some(hospital => hospital.name.toLowerCase() === authorizationForm.preferred_hospital.toLowerCase()) && (
                                                        <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                                            ⚠️ Similar hospitals found. Please select from the dropdown to avoid duplicates, or continue typing if this is a new hospital.
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Hospital Address: <span className="text-red-500">*</span></label>
                                                    <textarea
                                                        className="w-full p-2 border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-[#023184] transition-colors resize-none"
                                                        rows={2}
                                                        value={authorizationForm.hospital_address}
                                                        onChange={(e) => setAuthorizationForm({...authorizationForm, hospital_address: e.target.value})}
                                                        placeholder="Complete hospital address"
                                                    />
                                                    {formErrors.hospital_address && <span className="text-red-500 text-xs">{formErrors.hospital_address}</span>}
                                                </div>

                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">City: <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-2 border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-[#023184] transition-colors"
                                                        value={authorizationForm.hospital_city}
                                                        onChange={(e) => setAuthorizationForm({...authorizationForm, hospital_city: e.target.value})}
                                                        placeholder="Hospital city"
                                                    />
                                                    {formErrors.hospital_city && <span className="text-red-500 text-xs">{formErrors.hospital_city}</span>}
                                                </div>

                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Contact Number: <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="tel"
                                                        className="w-full p-2 border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-[#023184] transition-colors"
                                                        value={authorizationForm.hospital_contact}
                                                        onChange={(e) => setAuthorizationForm({...authorizationForm, hospital_contact: e.target.value})}
                                                        placeholder="Hospital contact number"
                                                    />
                                                    {formErrors.hospital_contact && <span className="text-red-500 text-xs">{formErrors.hospital_contact}</span>}
                                                </div>

                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Checkup Date: <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="date"
                                                        className="w-full p-2 border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-[#023184] transition-colors"
                                                        value={authorizationForm.checkup_date}
                                                        onChange={(e) => setAuthorizationForm({...authorizationForm, checkup_date: e.target.value})}
                                                    />
                                                    {formErrors.checkup_date && <span className="text-red-500 text-xs">{formErrors.checkup_date}</span>}
                                                </div>

                                                <div>
                                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Reason for Request: <span className="text-red-500">*</span></label>
                                                    <textarea
                                                        className="w-full p-2 border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-[#023184] transition-colors resize-none"
                                                        rows={2}
                                                        value={authorizationForm.reason_of_request}
                                                        onChange={(e) => setAuthorizationForm({...authorizationForm, reason_of_request: e.target.value})}
                                                        placeholder="Reason for requesting this specific hospital"
                                                    />
                                                    {formErrors.reason_of_request && <span className="text-red-500 text-xs">{formErrors.reason_of_request}</span>}
                                                </div>
                                            </>
                                        ) : (
                                            <div>
                                                <p className="text-gray-500 italic text-sm">No form available for this request type.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {!request && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 italic text-sm">Loading request information...</p>
                                    </div>
                                )}
                            </div>
                            )}

                            {/* Column 3 - Interactive PDF Card */}
                            <div className={`flex flex-col items-center justify-center ${shouldShowHRProcessing() ? 'order-1 md:order-3 xl:order-3' : 'order-1 md:order-2'}`}>
                                {loading || !user || !request ? (
                                    <div className="bg-white border-2 border-[#023184] rounded-xl shadow-lg p-3 sm:p-4 md:p-6 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] flex items-center justify-center min-h-[300px]">
                                        <p className="text-gray-500 italic text-sm">Loading PDF Card...</p>
                                    </div>
                                ) : (
                                <div className="bg-white border-2 border-[#023184] rounded-xl shadow-lg p-3 sm:p-4 md:p-6 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]">
                                    {/* Header */}
                                    <div className="text-center mb-3 sm:mb-4">
                                        <p className="text-[#023184] font-bold text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3 leading-tight px-1">
                                            HR WORKFLOW: REQUEST FOR APPROVAL PROCESS
                                        </p>
                                    </div>

                                    {/* PDF Icon and Title */}
                                    <div className="text-center mb-3 sm:mb-4">
                                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-red-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                                            <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-1 px-2 leading-tight">
                                            {getApprovalDocumentName()}
                                        </h3>
                                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">
                                            Official template document
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                                        {/* Preview button - Show only during Executive Clearance Review (hr_final_verification) */}
                                        {request?.current_status === 'hr_final_verification' && user?.role === 'hr_personnel' && (
                                            <>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            // Get the most recent staff file (signed document)
                                                            const staffFiles = (request?.files || []).filter(file =>
                                                                file.uploaded_by !== request.employee_id
                                                            );

                                                            const sortedStaffFiles = staffFiles.sort((a, b) =>
                                                                new Date(b.created_at) - new Date(a.created_at)
                                                            );

                                                            if (sortedStaffFiles.length > 0) {
                                                                const mostRecentFile = sortedStaffFiles[0];
                                                                // Remove /app/uploads/ prefix if it exists, backend /uploads endpoint already maps to it
                                                                const filePath = mostRecentFile.file_path.replace(/^\/app\/uploads\//, '');
                                                                const previewUrl = `${BACKEND_BASE_URL}/uploads/${filePath}`;
                                                                setPdfPreviewUrl(previewUrl);
                                                                setShowPdfPreview(true);
                                                            } else {
                                                                setErrorMessage('No signed document available to preview.');
                                                                setShowErrorModal(true);
                                                            }
                                                        } catch (error) {
                                                            console.error('Preview failed:', error);
                                                            setErrorMessage('Failed to load preview. Please try again.');
                                                            setShowErrorModal(true);
                                                        }
                                                    }}
                                                    className="w-full flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors text-xs sm:text-sm cursor-pointer font-semibold"
                                                >
                                                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="whitespace-nowrap">Preview PDF</span>
                                                </button>

                                                {/* Guide text */}
                                                <p className="text-[9px] sm:text-xs text-gray-500 text-center px-1 sm:px-2 leading-tight">
                                                    Review signed documents and approvals
                                                </p>
                                            </>
                                        )}

                                        {/* Fill & Sign button - Show only when user can approve and NOT in final verification */}
                                        {shouldShowFillAndSign() && (
                                            <>
                                                <button
                                                    onClick={() => setShowPdfEditor(true)}
                                                    className="w-full flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-xs sm:text-sm cursor-pointer font-semibold"
                                                >
                                                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="whitespace-nowrap">Fill & Sign PDF</span>
                                                </button>

                                                {/* Guide text */}
                                                <p className="text-[9px] sm:text-xs text-gray-500 text-center px-1 sm:px-2 leading-tight">
                                                    Fill & sign online or download, fill manually, and upload
                                                </p>
                                            </>
                                        )}

                                        <button
                                            onClick={async () => {
                                                try {
                                                    // Get all staff files (excluding executive files)
                                                    const staffFiles = (request?.files || []).filter(file =>
                                                        file.uploaded_by !== request.employee_id
                                                    );

                                                    // Sort by creation date to get most recent
                                                    const sortedStaffFiles = staffFiles.sort((a, b) =>
                                                        new Date(b.created_at) - new Date(a.created_at)
                                                    );

                                                    let downloadUrl, downloadFilename;

                                                    // If there's a signed staff file, download it
                                                    if (sortedStaffFiles.length > 0) {
                                                        const mostRecentFile = sortedStaffFiles[0];
                                                        // Remove /app/uploads/ prefix if it exists, backend /uploads endpoint already maps to it
                                                        const filePath = mostRecentFile.file_path.replace(/^\/app\/uploads\//, '');
                                                        downloadUrl = `${BACKEND_BASE_URL}/uploads/${filePath}`;
                                                        downloadFilename = mostRecentFile.original_file_name;
                                                    } else {
                                                        // Otherwise download the template
                                                        const templatePath = request?.request_type === 'letter_of_authorization'
                                                            ? 'Approval Letter of Authorization For Annual Medical Check-up Laboratory and Procedures.pdf'
                                                            : 'Approval For Annual Medical Check-up.pdf';
                                                        downloadUrl = encodeURI(`${BACKEND_BASE_URL}/templates/documents/${templatePath}`);
                                                        downloadFilename = templatePath.replace(/ /g, '_');
                                                    }

                                                    const response = await fetch(downloadUrl);

                                                    if (!response.ok) {
                                                        throw new Error(`HTTP error! status: ${response.status}`);
                                                    }

                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = downloadFilename;

                                                    document.body.appendChild(link);
                                                    link.click();

                                                    setTimeout(() => {
                                                        document.body.removeChild(link);
                                                        window.URL.revokeObjectURL(url);
                                                    }, 100);
                                                } catch (error) {
                                                    console.error('Download failed:', error);
                                                    setErrorMessage('Failed to download PDF. Please try again.');
                                                    setShowErrorModal(true);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm cursor-pointer"
                                        >
                                            <Download className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="whitespace-nowrap text-[10px] sm:text-xs md:text-sm">
                                                {request?.current_status === 'hr_final_verification' ? 'Download' : 'Download for signing'}
                                            </span>
                                        </button>

                                        {/* Upload Signed button - Hide during Executive Clearance Review */}
                                        {request?.current_status !== 'hr_final_verification' && (
                                            <button
                                                onClick={handleUpload}
                                                className="w-full flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm cursor-pointer"
                                            >
                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <span className="whitespace-nowrap">Upload Signed</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Executive's Request for Approval */}
                                    {(() => {
                                        const executiveFiles = request?.files?.filter(file =>
                                            file.uploaded_by === request.employee_id
                                        ) || [];
                                        return executiveFiles.length > 0 && (
                                            <div className="text-center mb-3 sm:mb-4 pt-3 sm:pt-4 border-t border-gray-200">
                                                <p className="text-[#023184] font-semibold text-[10px] sm:text-xs md:text-sm mb-1">
                                                    Request for approval:
                                                </p>
                                                <div className="space-y-1">
                                                    {executiveFiles.map((file) => (
                                                        <p
                                                            key={file.id}
                                                            className="text-[#023184] font-medium text-[9px] sm:text-xs cursor-pointer hover:underline hover:text-blue-600 break-words px-1 sm:px-2 leading-tight"
                                                            onClick={() => handleDownload(file.id, file.original_file_name)}
                                                            title="Click to download"
                                                        >
                                                            {file.original_file_name}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Show uploaded file status (Approver's signed document) */}
                                    {newlyUploadedFile && (
                                        <div className="text-center pt-3 sm:pt-4 border-t border-gray-200">
                                            <p className="text-green-600 font-semibold text-[10px] sm:text-xs md:text-sm mb-1">
                                                Signed Request for Approval uploaded ✓
                                            </p>
                                            <p className="text-gray-700 text-[9px] sm:text-xs break-words px-1 sm:px-2">
                                                {newlyUploadedFile.original_file_name}
                                            </p>
                                            <button
                                                onClick={removeNewlyUploadedFile}
                                                className="text-red-500 hover:text-red-700 p-1 sm:p-1.5 rounded-full hover:bg-red-50 transition-colors mt-1 sm:mt-2"
                                                title="Remove file"
                                            >
                                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                )}
                            </div>
                        </div>



                        {/* Action Buttons - Responsive */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                            {/* Request Files Button - Only available when user can approve (their turn to review) */}
                            {canApprove() && request && (
                                <button
                                    onClick={() => setShowFileRequestModal(true)}
                                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold hover:from-blue-700 hover:to-purple-700 transition-colors text-sm sm:text-base w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FileText size={20} />
                                    Request Files
                                </button>
                            )}

                            {/* Show Approve/Reject buttons when user can approve */}
                            {canApprove() && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        className="px-6 sm:px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                        title={['hr_personnel', 'benefits_officer', 'welfare_head'].includes(user?.role) ? 'File upload required before approval' : ''}
                                    >
                                        Approve {['hr_personnel', 'benefits_officer', 'welfare_head'].includes(user?.role) ? '' : ''}
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-6 sm:px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {/* Show Release button for HR personnel who have claimed the request */}
                            {user?.role === 'hr_personnel' &&
                             request?.current_status === 'hr_processing' &&
                             request?.assigned_hr_id === user?.id && (
                                <button
                                    onClick={handleRelease}
                                    className="px-6 sm:px-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                    title="Release this request back to the pending pool for other HR to claim"
                                >
                                    Release Request
                                </button>
                            )}

                            {/* Show Return button when applicable */}
                            {canShowReturn() && (
                                <button
                                    onClick={handleReturn}
                                    className="px-6 sm:px-8 py-3 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                >
                                    Return
                                </button>
                            )}

                            {/* Show informational message for HR who can see the form but cannot approve yet */}
                            {!canApprove() && !canShowReturn() && user?.role === 'hr_personnel' && request && (
                                <div className="text-center">
                                    <p className="text-blue-600 text-sm sm:text-base mb-2">
                                        {request?.current_status === 'hr_processing' && request?.assigned_hr_id !== user.id
                                            ? 'This request is assigned to another HR personnel.'
                                            : request?.current_status === 'benefits_review'
                                            ? 'Request is currently under Benefits Officer review.'
                                            : request?.current_status === 'welfare_review'
                                            ? 'Request is currently under Welfare Head review.'
                                            : request?.current_status === 'hr_final_verification'
                                            ? 'Request is under Executive Clearance Review for final document verification.'
                                            : request?.current_status === 'approved'
                                            ? 'Request has been fully approved.'
                                            : request?.current_status === 'rejected'
                                            ? 'Request has been rejected.'
                                            : 'Fill in the processing information and submit when ready.'}
                                    </p>
                                </div>
                            )}

                            {/* Show message for non-HR users */}
                            {!canApprove() && !canShowReturn() && user?.role !== 'hr_personnel' && (
                                <p className="text-gray-500 italic text-center text-sm sm:text-base">You do not have permission to process this request.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Modal - Responsive */}
            {showApproveModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl md:rounded-[32px] shadow-lg border border-gray-300 overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Gradient header with X button */}
                        <div
                            className="flex items-center justify-between px-4 md:px-6 py-2"
                            style={{
                                background: "linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                            }}
                        >
                            <span className="text-white font-semibold">&nbsp;</span>
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setApprovalComment("");
                                }}
                                aria-label="Close approval modal"
                                className="text-white text-2xl md:text-3xl font-bold leading-none hover:opacity-80"
                                style={{ lineHeight: "1" }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal content - Responsive */}
                        <div className="flex flex-col p-4 md:p-6 bg-white">
                            {/* Top section with icon and text - Responsive layout */}
                            <div className="flex flex-col md:flex-row items-start mb-4">
                                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 self-center md:self-start">
                                    <img
                                        src={ExclamationPoint}
                                        alt="Exclamation Point"
                                        className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36"
                                    />
                                </div>

                                {/* Text content */}
                                <div className="flex-grow">
                                    <h2 className="text-[#023184] text-lg sm:text-xl font-bold mb-2 text-center md:text-left">
                                        Approve {formatRequestType(request?.request_type)}
                                    </h2>
                                    <p className="text-gray-700 text-center md:text-left text-sm sm:text-base leading-relaxed mb-4">
                                        Are you sure you want to <strong>approve</strong> this request?
                                        Once approved, it will be forwarded for review and{" "}
                                        <strong>cannot</strong> be edited.
                                    </p>

                                    <p className="text-gray-600 text-center md:text-left text-sm sm:text-base mb-3">
                                        If you have any comments, kindly leave them here.
                                    </p>
                                </div>
                            </div>

                            {/* Text area - Responsive */}
                            <div className="mb-4">
                                <textarea
                                    value={approvalComment}
                                    onChange={(e) => setApprovalComment(e.target.value)}
                                    className="w-full h-20 sm:h-24 p-3 border-2 border-gray-300 rounded-lg resize-none outline-none text-gray-700 focus:border-[#023184] transition-colors text-sm sm:text-base"
                                    placeholder="Optional: Enter your comments here..."
                                />
                            </div>

                            {/* Action buttons - Responsive */}
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <button
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setApprovalComment("");
                                    }}
                                    className="px-6 sm:px-8 py-2 bg-gray-400 text-white rounded-full font-medium hover:bg-gray-500 transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                                    style={{
                                        backgroundColor: "#CACACA",
                                        color: "#4E4E4E",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApprove}
                                    disabled={isSubmitting}
                                    className={`px-6 sm:px-8 py-2 text-white rounded-full font-medium transition-colors text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2 ${
                                        isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'
                                    }`}
                                    style={{ backgroundColor: isSubmitting ? '#9CA3AF' : "#023184", color: "white" }}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Submitting...</span>
                                        </div>
                                    ) : (
                                        'Submit'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal - Responsive */}
            {showRejectModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl md:rounded-[32px] shadow-lg border border-gray-300 overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Gradient header */}
                        <div
                            className="flex items-center justify-between px-4 md:px-6 py-2"
                            style={{
                                background: "linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                            }}
                        >
                            <span className="text-white font-semibold text-sm sm:text-base">Reason for Rejection</span>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                }}
                                aria-label="Close rejection modal"
                                className="text-white text-2xl md:text-3xl font-bold leading-none hover:opacity-80"
                                style={{ lineHeight: "1" }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal content - Responsive */}
                        <div className="p-4 md:p-6 bg-white">
                            <p className="text-gray-700 mb-4 text-sm sm:text-base">Kindly leave a comment explaining the reason for rejection.</p>

                            {/* Text area with box - Responsive */}
                            <div className="relative mb-6">
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full h-32 sm:h-40 md:h-48 p-4 border-2 border-gray-300 rounded-lg resize-none outline-none text-gray-700 focus:border-[#023184] transition-colors text-sm sm:text-base"
                                    placeholder="Enter your comment here..."
                                />
                            </div>

                            {/* Action buttons - Responsive */}
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason("");
                                    }}
                                    className="px-6 sm:px-8 py-2 bg-gray-400 text-white rounded-full font-medium hover:bg-gray-500 transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReject}
                                    disabled={isSubmitting}
                                    className={`px-6 sm:px-8 py-2 text-white rounded-full font-medium transition-colors text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2 ${
                                        isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Submitting...</span>
                                        </div>
                                    ) : (
                                        'Submit'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Release Request Modal - Responsive */}
            {showReleaseModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl md:rounded-[32px] shadow-lg border border-gray-300 overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Gradient header */}
                        <div
                            className="flex items-center justify-between px-4 md:px-6 py-2"
                            style={{
                                background: "linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                            }}
                        >
                            <span className="text-white font-semibold text-sm sm:text-base">Release Request</span>
                            <button
                                onClick={() => {
                                    setShowReleaseModal(false);
                                    setReleaseReason("");
                                }}
                                aria-label="Close release modal"
                                className="text-white text-2xl md:text-3xl font-bold leading-none hover:opacity-80"
                                style={{ lineHeight: "1" }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal content - Responsive */}
                        <div className="p-4 md:p-6 bg-white">
                            <div className="mb-4">
                                <p className="text-gray-700 mb-2 text-sm sm:text-base font-semibold">Are you sure you want to release this request?</p>
                                <p className="text-gray-600 text-xs sm:text-sm">
                                    This request will be returned to the pending pool and will be available for other HR personnel to claim.
                                </p>
                            </div>

                            <p className="text-gray-700 mb-3 text-sm sm:text-base">Reason for releasing (optional):</p>

                            {/* Text area with box - Responsive */}
                            <div className="relative mb-6">
                                <textarea
                                    value={releaseReason}
                                    onChange={(e) => setReleaseReason(e.target.value)}
                                    className="w-full h-24 sm:h-32 p-4 border-2 border-gray-300 rounded-lg resize-none outline-none text-gray-700 focus:border-[#023184] transition-colors text-sm sm:text-base"
                                    placeholder="e.g., Going on leave, workload balancing, requires specialized expertise..."
                                />
                            </div>

                            {/* Action buttons - Responsive */}
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <button
                                    onClick={() => {
                                        setShowReleaseModal(false);
                                        setReleaseReason("");
                                    }}
                                    className="px-6 sm:px-8 py-2 bg-gray-400 text-white rounded-full font-medium hover:bg-gray-500 transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRelease}
                                    disabled={isSubmitting}
                                    className={`px-6 sm:px-8 py-2 text-white rounded-full font-medium transition-colors text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2 ${
                                        isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Releasing...</span>
                                        </div>
                                    ) : (
                                        'Release Request'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal - Responsive */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    {/* Modal Container - Responsive */}
                    <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
                        flex items-center justify-between text-white px-4 py-2">
                            <h2 className="text-white text-sm sm:text-base font-semibold">Upload</h2>
                            <button
                                onClick={closeUploadModal}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Modal Body - Responsive */}
                        <div className="p-4 sm:p-6">
                            {!tempFile ? (
                                /* Upload Area - Responsive */
                                <div
                                    className={`flex flex-col items-center justify-center rounded-2xl 
                                        transition-all duration-200 cursor-pointer px-6 sm:px-12 md:px-20 py-8 sm:py-10 text-sm
                                        ${isDragOver
                                            ? 'bg-blue-50'
                                            : 'hover:bg-gray-50'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={handleUploadAreaClick}
                                >
                                    {/* Upload Icon - Responsive */}
                                    <img src={UploadIcon} alt="Upload Icon" className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 mb-2" />

                                    {/* Upload Text - Responsive */}
                                    <p className="text-gray-600 text-center text-sm sm:text-base px-2">
                                        {isDragOver
                                            ? 'Drop your file here!'
                                            : `Drop ${getApprovalDocumentName()} here, or click here to browse`
                                        }
                                    </p>
                                    {/* Hidden File Input */}
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                /* File Selected View - Responsive */
                                <div>
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg mb-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{tempFile.name}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">{(tempFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setTempFile(null)}
                                            className="text-gray-400 hover:text-gray-600 ml-2"
                                        >
                                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                        <button
                                            onClick={closeUploadModal}
                                            className="px-4 sm:px-6 py-2 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleFinalUpload}
                                            className="px-4 sm:px-6 py-2 bg-[#023184] text-white rounded-full font-medium hover:bg-[#034299] transition-colors text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#3F6EC0] via-[#00539F] via-[#5D3EA4] to-[#7940A8] text-white px-6 py-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                Success
                            </h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-700 text-center mb-6">
                                {successMessage}
                            </p>

                            {/* Action Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="px-6 py-3 bg-[#023184] text-white rounded-full font-medium hover:bg-[#034299] transition-colors text-sm sm:text-base"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal - Enhanced with better formatting */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-6 py-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                Action Failed
                            </h2>
                        </div>

                        {/* Modal Body with enhanced formatting */}
                        <div className="p-6">
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="text-sm text-red-800 whitespace-pre-line leading-relaxed">
                                            {errorMessage}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 mb-4 italic">
                                Please review the errors above and try again after making the necessary corrections.
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowErrorModal(false)}
                                    className="px-8 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                                >
                                    I Understand
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Remove File Modal */}
            {showConfirmRemoveModal && fileToRemove && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#3F6EC0] via-[#00539F] via-[#5D3EA4] to-[#7940A8] text-white px-6 py-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                    <X className="w-4 h-4 text-white" />
                                </div>
                                Remove File
                            </h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to remove this file? This action cannot be undone.
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-900 text-sm">
                                        📄 {fileToRemove.original_file_name}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={cancelRemoveFile}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRemoveFile}
                                    className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
                                >
                                    Remove File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* File Request Modal */}
            <FileRequestModal
                isOpen={showFileRequestModal}
                onClose={() => setShowFileRequestModal(false)}
                requestId={requestId}
                onSuccess={() => {
                    // Optionally refresh request data after file request is sent
                    fetchRequest();
                }}
            />

            {/* PDF Editor Modal - Progressive Signing: Each approver signs the most recent version */}
            <PdfEditorModal
                isOpen={showPdfEditor}
                onClose={() => setShowPdfEditor(false)}
                pdfUrl={getPdfUrlForFillAndSign()}
                onSave={handlePdfEditorSave}
                templateName={
                    request?.request_type === 'letter_of_authorization'
                        ? 'Approval_Letter_of_Authorization_For_Annual_Medical_Check-up_Laboratory_and_Procedures.pdf'
                        : 'Approval_For_Annual_Medical_Check-up.pdf'
                }
            />

            {/* PDF Preview Modal - Read-only preview for Executive Clearance Review */}
            <PdfPreviewModal
                isOpen={showPdfPreview}
                onClose={() => {
                    setShowPdfPreview(false);
                    setPdfPreviewUrl(null);
                }}
                pdfUrl={pdfPreviewUrl}
                fileName={
                    request?.files?.filter(f => f.uploaded_by !== request.employee_id)
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.original_file_name || 'document.pdf'
                }
            />
        </div>
    );
}