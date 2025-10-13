import React, { useState, useEffect } from "react";
import {  X, Check, Download, ExternalLink, Eye} from "lucide-react";
import NavBarMain from "@/Components/NavBarMain";
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/mainLogo-foreground.svg";
import DocumentIcon from "@/assets/documenticon.svg";
import UploadIcon from "@/assets/uploadicon.svg";
import Confirmation from "@/assets/confirmation.svg";
import SuccessIcon from "@/assets/success.svg";
import ErrorIcon from "@/assets/error.svg";
import apiService from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SubmitLetterOfAuthorization() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  const [uploadedFiles, setUploadedFiles] = useState([]); // Changed to array
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalState, setModalState] = useState('confirm'); // 'confirm', 'success', 'error'
  const [isDragOver, setIsDragOver] = useState(false);
  const [tempFiles, setTempFiles] = useState([]); // Changed to array for multiple files
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [isCheckingRequest, setIsCheckingRequest] = useState(true);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Check for active request on component mount
  useEffect(() => {
    const checkActiveRequest = async () => {
      try {
        const response = await apiService.checkActiveRequest();
        if (response.success && response.hasActiveRequest) {
          setHasActiveRequest(true);
          setActiveRequest(response.activeRequest);
          setShowDuplicateModal(true);
        }
      } catch (error) {
        console.error('Error checking active request:', error);
      } finally {
        setIsCheckingRequest(false);
      }
    };

    checkActiveRequest();
  }, []);

  const handleFileUpload = (files) => {
    // Filter for PDF files only
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    if (pdfFiles.length > 0) {
      setTempFiles(pdfFiles); // Store all PDF files temporarily until confirmed
    } else {
      alert('Please select PDF files only');
    }
  };

  const confirmFileUpload = () => {
    if (tempFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...tempFiles]); // Add to existing files
      setTempFiles([]);
      setShowUploadModal(false);
    }
  };

  const cancelFileUpload = () => {
    setTempFiles([]);
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
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
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleUploadAreaClick = () => {
    if (tempFiles.length === 0) {
      document.getElementById('fileInput').click();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalState('confirm'); // Reset to initial state
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setIsDragOver(false);
    setTempFiles([]); // Clear temp files when closing
  };

  const handleSubmit = async () => {
    try {
      const fileNames = uploadedFiles.map(f => f.name).join(', ');
      console.log(`Submitting Letter of Authorization request with ${uploadedFiles.length} file(s):`, fileNames);

      // Create the checkup request
      const requestData = {
        request_type: 'letter_of_authorization',
        letter_purpose: `Annual executive health checkup - Letter of Authorization request submitted via web portal with ${uploadedFiles.length} document(s): ${fileNames}`,
        priority_level: 'normal'
      };

      console.log('Creating request with data:', requestData);
      const response = await apiService.createRequest(requestData);

      if (response.success) {
        console.log('✅ Request created successfully:', response.data.request);
        const requestId = response.data.request.id;

        // Upload all files sequentially
        if (uploadedFiles.length > 0) {
          console.log(`📄 Uploading ${uploadedFiles.length} PDF file(s) to request_files...`);
          let uploadSuccessCount = 0;

          for (let i = 0; i < uploadedFiles.length; i++) {
            try {
              const file = uploadedFiles[i];
              console.log(`Uploading file ${i + 1}/${uploadedFiles.length}: ${file.name}`);
              const uploadResponse = await apiService.uploadRequestFile(requestId, file);

              if (uploadResponse.success) {
                console.log(`✅ File ${i + 1} uploaded successfully:`, uploadResponse.data);
                uploadSuccessCount++;
              } else {
                console.error(`❌ Failed to upload file ${i + 1}:`, uploadResponse);
              }
            } catch (uploadError) {
              console.error(`❌ Error uploading file ${i + 1}:`, uploadError);
            }
          }

          console.log(`✅ Successfully uploaded ${uploadSuccessCount}/${uploadedFiles.length} files`);
          setModalState('success');
        } else {
          setModalState('success');
        }
      } else {
        console.error('❌ Failed to create request:', response);
        setModalState('error');
      }
    } catch (error) {
      console.error('❌ Error submitting request:', error);
      setModalState('error');
    }
  };

  // Show loading while checking for active request
  if (isCheckingRequest) {
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking for active requests...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Top Nav */}
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

      {/* Duplicate Request Modal */}
      {showDuplicateModal && hasActiveRequest && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Active Request Exists</h2>
              <p className="text-gray-600 mb-4">
                You already have an active request. You can only submit a new request after your current request is completed, approved, or rejected.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 w-full">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Request Number:</span> {activeRequest?.request_number}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Type:</span> {activeRequest?.request_type === 'letter_of_approval' ? 'Letter of Approval' : 'Letter of Authorization'}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Status:</span> <span className="capitalize">{activeRequest?.current_status?.replace('_', ' ')}</span>
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => navigate('/loa-status-tracker', {
                    state: {
                      requestDetails: {
                        ...activeRequest,
                        // Ensure consistent field mappings
                        request_type: activeRequest.request_type || "Letter of Authorization",
                        request_id: activeRequest.id,
                        created_at: activeRequest.created_at,
                        first_name: user?.first_name,
                        last_name: user?.last_name,
                        current_status: activeRequest.current_status,
                        request_number: activeRequest.request_number,
                      }
                    }
                  })}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
                >
                  View Request
                </button>
                <button
                  onClick={() => navigate('/executive-employee-dashboard')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900">
        Submit Letter of Authorization
      </h1>

      {/* Container */}
      <div className="flex justify-center px-4 py-4 max-w-7xl mx-auto">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-[#00539F]/30 px-8 py-4 sm:pb-8 sm:pt-4
        border border-gray-200 
        outline outline-[#00539F]">
          <h2 className="text-base font-semibold text-center text-blue-900">
            Details
          </h2>

          {/* Desktop Layout: Upload - Document - Submit */}
          <div className="hidden md:flex items-center justify-center space-x-12">
            
            {/* Left Side: Upload Button */}
            <div className="flex flex-col items-center justify-end h-96 w-48">
              {/* File info above button - scrollable container for multiple files */}
              <div className="max-h-40 overflow-y-auto flex flex-col justify-end mb-4 w-full">
                {uploadedFiles.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-green-700 text-center">
                      {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded!
                    </p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 rounded px-2 py-1">
                        <p className="text-xs text-gray-700 truncate flex-1" title={file.name}>
                          {file.name}
                        </p>
                        <button
                          onClick={() => removeUploadedFile(index)}
                          className="text-red-500 hover:text-red-700 p-1 ml-1 flex-shrink-0 cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-800 text-white px-8 py-3 rounded-full shadow-md hover:bg-blue-900 text-base font-medium mb-4 cursor-pointer"
              >
                Upload
              </button>
            </div>

            {/* Center: PDF Document Card */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg p-6 w-60 sm:w-72 md:w-80 lg:w-96">
                {/* PDF Icon and Title */}
                <div className="text-center mb-4">
                  <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">
                    Request Letter of Authorization
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Official template document
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  

                  <button
                    onClick={async () => {
                      try {
                        // Fetch the PDF as a blob to force download instead of opening in browser (mobile-friendly)
                        // URL encode the filename to handle spaces
                        const encodedPath = encodeURI(`${BACKEND_BASE_URL}/templates/documents/Request Letter of Authorization.pdf`);
                        const response = await fetch(encodedPath);

                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'Request_Letter_of_Authorization.pdf';

                        // Mobile-friendly approach: Add link to DOM and trigger click
                        document.body.appendChild(link);
                        link.click();

                        // Clean up after a short delay to ensure download started
                        setTimeout(() => {
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        }, 100);
                      } catch (error) {
                        console.error('Download failed:', error);
                        alert(`Failed to download PDF: ${error.message}. The template file may not exist on the server. Please contact your administrator.`);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mt-2">
                      Please fill out, and sign this document and upload here
                    </p>
                  </div>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 text-center w-full px-4">
                  <p className="text-xs sm:text-sm text-green-600 font-semibold mb-1">
                    ✓ {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded
                  </p>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 rounded px-2 py-1 text-left">
                        <p className="text-xs text-gray-700 truncate flex-1" title={file.name}>
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Submit Button */}
            <div className="flex flex-col items-center justify-end h-96 w-48">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={uploadedFiles.length === 0}
                className={`px-8 py-3 rounded-full font-medium shadow-lg text-base mb-4 ${
                  uploadedFiles.length > 0
                    ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Mobile Layout: Document - Upload - Submit (stacked vertically) */}
          <div className="md:hidden flex flex-col items-center space-y-6 py-4">
            
            {/* 1. PDF Document Card at top */}
            <div className="flex flex-col items-center">
              <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg p-4 w-72">
                {/* PDF Icon and Title */}
                <div className="text-center mb-3">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">
                    Request Letter of Authorization
                  </h3>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => window.open(`${BACKEND_BASE_URL}/templates/documents/Request%20Letter%20of%20Authorization.pdf`, '_blank')}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        // Fetch the PDF as a blob to force download instead of opening in browser (mobile-friendly)
                        // URL encode the filename to handle spaces
                        const encodedPath = encodeURI(`${BACKEND_BASE_URL}/templates/documents/Request Letter of Authorization.pdf`);
                        const response = await fetch(encodedPath);

                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'Request_Letter_of_Authorization.pdf';

                        // Mobile-friendly approach: Add link to DOM and trigger click
                        document.body.appendChild(link);
                        link.click();

                        // Clean up after a short delay to ensure download started
                        setTimeout(() => {
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        }, 100);
                      } catch (error) {
                        console.error('Download failed:', error);
                        alert(`Failed to download PDF: ${error.message}. The template file may not exist on the server. Please contact your administrator.`);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-2 text-center w-full px-4">
                  <p className="text-xs text-green-600 font-semibold mb-1">
                    ✓ {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded
                  </p>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 rounded px-2 py-1 text-left">
                        <p className="text-xs text-gray-700 truncate flex-1" title={file.name}>
                          {file.name}
                        </p>
                        <button
                          onClick={() => removeUploadedFile(index)}
                          className="text-red-500 hover:text-red-700 p-1 ml-1 cursor-pointer"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Upload Button in middle */}
            <div className="flex flex-col items-center space-y-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-800 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-blue-900 text-sm font-medium min-w-24 cursor-pointer"
              >
                Upload
              </button>
              {uploadedFiles.length > 0 && (
                <div className="flex flex-col items-center space-y-1 w-full px-4">
                  <p className="text-xs text-green-600 font-semibold">
                    {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready
                  </p>
                  <div className="max-h-24 overflow-y-auto space-y-1 w-full">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 rounded px-2 py-1">
                        <p className="text-xs text-gray-700 truncate flex-1" title={file.name}>
                          {file.name}
                        </p>
                        <button
                          onClick={() => removeUploadedFile(index)}
                          className="text-red-500 hover:text-red-700 p-1 ml-1 cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Submit Button at bottom */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={uploadedFiles.length === 0}
                className={`px-4 py-2 rounded-full font-medium shadow-lg text-xs w-20 ${
                  uploadedFiles.length > 0
                    ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Modal Container */}
          <div className="bg-white rounded-3xl shadow-xl w-130 max-w-200 mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
            flex items-center justify-between text-white px-4 py-2">
              <h2 className="text-white text-sm font-semibold">Upload</h2>
              <button
                onClick={closeUploadModal}
                className="text-white hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="pb-2">
              {tempFiles.length === 0 ? (
                /* Upload Area */
                <div 
                  className={`flex flex-col items-center justify-center rounded-2xl 
                    transition-all duration-200 cursor-pointer px-20 py-10 text-sm
                    ${isDragOver 
                      ? 'bg-blue-50' 
                      : 'hover:bg-gray-50'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadAreaClick}
                >
                  {/* Upload Icon */}
                  <img src={UploadIcon} alt="Upload Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 sm:mb-3" />
                  
                  {/* Upload Text */}
                  <p className="text-gray-600 text-center">
                    {isDragOver 
                      ? 'Drop your file here!' 
                      : 'Drop signed document here, or click here to browse'
                    }
                  </p>

                  {/* Hidden File Input - now accepts multiple files */}
                  <input
                    id="fileInput"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                /* File Confirmation Area - Multiple Files */
                <div className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 text-center">
                    {tempFiles.length} file{tempFiles.length > 1 ? 's' : ''} selected
                  </p>

                  <div className="max-h-64 overflow-y-auto space-y-2 mb-3 sm:mb-4">
                    {tempFiles.map((file, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center space-x-2">
                          <img src={DocumentIcon} alt="Document" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center">
                    Are these the correct files you want to upload?
                  </p>

                  {/* Confirmation Buttons */}
                  <div className="flex justify-center space-x-2 sm:space-x-4">
                    <button
                      onClick={cancelFileUpload}
                      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-full border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 text-xs sm:text-sm cursor-pointer"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={confirmFileUpload}
                      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 text-xs sm:text-sm cursor-pointer"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Confirm All</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full relative overflow-hidden mx-6">
            {/* Header */}
            <div className="flex justify-between items-center 
              bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
              text-white px-4 py-2" 
            >
              <h2 className="text-xs font-semibold">
                {(!modalState || modalState === 'confirm') && 'Confirmation'}
                {modalState === 'success' && 'Submitted'}
                {modalState === 'error' && 'Not Submitted'}
              </h2>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 md:p-6">
              {/* Confirmation State */}
              {(!modalState || modalState === 'confirm') && (
                <>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
                    <img src={Confirmation} alt="Confirmation Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-blue-900 mb-2">
                        Submit Letter of Authorization
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Are you sure you want to
                        <span className="font-semibold"> submit</span> this request? Once submitted, it will be forwarded for review and <span className="font-semibold text-red-500">cannot be edited</span>.
                      </p>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4">
                    <button
                      onClick={closeModal}
                      className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full bg-blue-900 text-white hover:bg-blue-800 text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}

              {/* Success State */}
              {modalState === 'success' && (
                <div className="text-center py-2 sm:py-4">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <img src={SuccessIcon} alt="Success Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-blue-900 mb-3 sm:mb-4">
                    Success! Your request has been submitted.
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                    Your Letter of Authorization request has been successfully submitted with the uploaded document.
                    Please wait for an automated notification email from the Human Resource Personnel regarding the acceptance of your request.
                  </p>
                  <button
                    onClick={() => navigate('/executive-employee-dashboard')}
                    className="px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm md:text-base transition-colors cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}

              {/* Error State */}
              {modalState === 'error' && (
                <div className="text-center py-2 sm:py-4">
                  <div className="flex justify-center mb-3 sm:mb-4">
                      <img src={ErrorIcon} alt="Error Icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-blue-900 mb-3 sm:mb-4">
                    Error! Your request has not been submitted.
                  </h3>
                  <button
                    onClick={closeModal}
                    className="px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm md:text-base transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}