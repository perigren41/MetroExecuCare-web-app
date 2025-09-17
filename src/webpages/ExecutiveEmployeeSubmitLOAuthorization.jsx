import React, { useState } from "react";
import {  X, Check} from "lucide-react";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";
import DocumentIcon from "@/assets/documenticon.svg";
import UploadIcon from "@/assets/uploadicon.svg";
import Confirmation from "@/assets/confirmation.svg";
import SuccessIcon from "@/assets/success.svg";
import ErrorIcon from "@/assets/error.svg"; 

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
      console.log("Submitting:", uploadedFile);
      // TODO: API call → insert into checkup_requests + request_files
      
      // Simulate API call
      // await submitRequest(uploadedFile);
      
      setModalState('success');
    } catch (error) {
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
        outline outline-2 outline-[#00539F]">
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
                      <X className="w-4 h-4" />
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

            {/* Center: Large Document Icon */}
            <div className="flex flex-col items-center w-90">
              <img 
                src={DocumentIcon}
                alt="Document Icon" 
                className="w-100 h-100 mb-4" 
              />
              {uploadedFile && (
                <p className="text-sm text-blue-900 font-medium">
                  {uploadedFile.name}
                </p>
              )}
            </div>

            {/* Right Side: Submit Button */}
            <div className="flex flex-col items-center justify-end h-96 w-48">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 shadow-lg text-base mb-4"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Mobile Layout: Document - Upload - Submit (stacked vertically) */}
          <div className="md:hidden flex flex-col items-center space-y-6 py-4">
            
            {/* 1. Document Icon at top */}
            <div className="flex flex-col items-center">
              <img 
                src={DocumentIcon}
                alt="Document Icon" 
                className="w-40 h-40 " 
              />
              {uploadedFile && (
                <p className="text-sm text-blue-900 font-medium text-center">
                  {uploadedFile.name}
                </p>
              )}
            </div>

            {/* 2. Upload Button in middle */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-800 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-900 text-xs font-medium text-sm w-20"
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
                className="bg-green-600 text-white px-4 py-2 rounded-full font-medium hover:bg-green-700 shadow-lg text-xs w-20"
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
                  <img src={UploadIcon} alt="Upload Icon" className="w-30 h-30 mb-2" />
                  
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
            <div className="pl-4 pr-6 pb-4 pt-2">
              {/* Confirmation State */}
              {(!modalState || modalState === 'confirm') && (
                <>
                  <div className="flex items-center">
                    <img src={Confirmation} alt="Confirmation Icon" className="w-30 h-30 text-white" />
                    <div>
                      <h3 className="text-md font-bold text-blue-900">
                        Submit Letter of Approval
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Are you sure you want to
                        <span className="font-semibold"> submit</span> this request? Once submitted, it will be forwarded for review and <span className="font-semibold text-red-500">cannot be edited</span>.
                      </p>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex justify-end space-x-4 text-sm">
                    <button
                      onClick={() => setModalState('error')}
                      className="px-4 py-1 rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-1 rounded-full bg-blue-900 text-white hover:bg-blue-800"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}

              {/* Success State */}
              {modalState === 'success' && (
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <img src={SuccessIcon} alt="Success Icon" className="w-20 h-20 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-blue-900 mb-2">
                    Success! Your request has been submitted.
                  </h3>
                  <button
                    onClick={closeModal}
                    className="mt-2 px-4 py-1 rounded-full bg-blue-900 hover:bg-blue-800 text-white text-sm"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Error State */}
              {modalState === 'error' && (
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                      <img src={ErrorIcon} alt="Error Icon" className="w-20 h-20 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-blue-900 mb-2">
                    Error! Your request has not been submitted.
                  </h3>
                  <button
                    onClick={closeModal}
                    className="mt-2 px-4 py-1 rounded-full bg-blue-900 hover:bg-blue-800 text-white text-sm"
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