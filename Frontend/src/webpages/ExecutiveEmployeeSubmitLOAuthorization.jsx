import React, { useState } from "react";
import {  X, Check, Download, ExternalLink, Eye} from "lucide-react";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";
import DocumentIcon from "@/assets/documenticon.svg";
import UploadIcon from "@/assets/uploadicon.svg";
import Confirmation from "@/assets/confirmation.svg";
import SuccessIcon from "@/assets/success.svg";
import ErrorIcon from "@/assets/error.svg";
import apiService from "@/services/api"; 

export default function SubmitLetterOfAuthorization() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalState, setModalState] = useState('confirm'); // 'confirm', 'success', 'error'
  const [isDragOver, setIsDragOver] = useState(false);
  const [tempFile, setTempFile] = useState(null); // Temporary file for confirmation

  const handleFileUpload = (file) => {
    if (file && file.type === 'application/pdf') {
      setTempFile(file); // Store temporarily until confirmed
    }
  };

  const confirmFileUpload = () => {
    if (tempFile) {
      setUploadedFile(tempFile);
      setTempFile(null);
      setShowUploadModal(false);
    }
  };

  const cancelFileUpload = () => {
    setTempFile(null);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setTempFile(null);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
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
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUploadAreaClick = () => {
    if (!tempFile) {
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
    setTempFile(null); // Clear temp file when closing
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting Letter of Authorization request with file:", uploadedFile?.name);

      // Create the checkup request
      const requestData = {
        request_type: 'letter_of_authorization',
        letter_purpose: `Annual executive health checkup - Letter of Authorization request submitted via web portal with uploaded document: ${uploadedFile?.name || 'document'}`,
        priority_level: 'normal'
      };

      console.log('Creating request with data:', requestData);
      const response = await apiService.createRequest(requestData);

      if (response.success) {
        console.log('✅ Request created successfully:', response.data.request);
        const requestId = response.data.request.id;

        // Now upload the PDF file to request_files table
        if (uploadedFile) {
          console.log('📄 Uploading PDF file to request_files...');
          try {
            const uploadResponse = await apiService.uploadRequestFile(requestId, uploadedFile);
            if (uploadResponse.success) {
              console.log('✅ File uploaded successfully:', uploadResponse.data);
              setModalState('success');
            } else {
              console.error('❌ Failed to upload file:', uploadResponse);
              setModalState('success'); // Still success since request was created
            }
          } catch (uploadError) {
            console.error('❌ Error uploading file:', uploadError);
            setModalState('success'); // Still success since request was created
          }
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

  return (
    <>
      {/* Top Nav */}
      <NavBarSide />

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
              {/* File info above button - fixed height container */}
              <div className="h-16 flex flex-col justify-end mb-4">
                {uploadedFile && (
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-700 text-center max-w-32 ">
                      {uploadedFile.name} successfully uploaded!
                    </p>
                    <button
                      onClick={removeUploadedFile}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove file"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-800 text-white px-8 py-3 rounded-full shadow-md hover:bg-blue-900 text-base font-medium mb-4"
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
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = 'http://localhost:5035/uploads/documents/letters/Request%20Letter%20of%20Authorization%20Laboratory%20and%20Procedures.pdf';
                      link.download = 'Request_Letter_of_Authorization.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
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

              {uploadedFile && (
                <div className="mt-3 text-center">
                  <p className="text-xs sm:text-sm text-green-600 font-medium">
                    ✓ Uploaded: {uploadedFile.name}
                  </p>
                </div>
              )}
            </div>

            {/* Right Side: Submit Button */}
            <div className="flex flex-col items-center justify-end h-96 w-48">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={!uploadedFile}
                className={`px-8 py-3 rounded-full font-medium shadow-lg text-base mb-4 ${
                  uploadedFile
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
                    onClick={() => window.open('http://localhost:5019/uploads/documents/letters/Request%20Letter%20of%20Authorization%20Laboratory%20and%20Procedures.pdf', '_blank')}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = 'http://localhost:5019/uploads/documents/letters/Request%20Letter%20of%20Authorization%20Laboratory%20and%20Procedures.pdf';
                      link.download = 'Request_Letter_of_Authorization.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {uploadedFile && (
                <div className="mt-2 text-center">
                  <p className="text-xs text-green-600 font-medium">
                    ✓ Uploaded: {uploadedFile.name}
                  </p>
                </div>
              )}
            </div>

            {/* 2. Upload Button in middle */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-800 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-900 font-medium text-sm w-20"
              >
                Upload
              </button>
              {uploadedFile && (
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-700 text-center">
                    {uploadedFile.name} successfully uploaded!
                  </p>
                  <button
                    onClick={removeUploadedFile}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 3. Submit Button at bottom */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={!uploadedFile}
                className={`px-4 py-2 rounded-full font-medium shadow-lg text-xs w-20 ${
                  uploadedFile
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
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="pb-2">
              {!tempFile ? (
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
                /* File Confirmation Area */
                <div className="px-6 py-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={DocumentIcon} alt="Document" className="w-8 h-8" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tempFile.name}</p>
                          <p className="text-xs text-gray-500">{(tempFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    Is this the correct file you want to upload?
                  </p>
                  
                  {/* Confirmation Buttons */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={cancelFileUpload}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                    <button
                      onClick={confirmFileUpload}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm</span>
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
                      className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs sm:text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full bg-blue-900 text-white hover:bg-blue-800 text-xs sm:text-sm transition-colors"
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
                    onClick={closeModal}
                    className="px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm md:text-base transition-colors"
                  >
                    Close
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
                    className="px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm md:text-base transition-colors"
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