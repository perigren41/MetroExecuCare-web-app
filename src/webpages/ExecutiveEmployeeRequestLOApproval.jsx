import React, { useState } from "react";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";

export default function ExecutiveEmployeeRequestLOApproval() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // modal state

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setMessage(`${uploadedFile.name} successfully uploaded!`);
      setIsModalOpen(false); // close modal after selection
    }
  };

  const handleSubmit = () => {
    if (file) {
      alert(`Submitting: ${file.name}`);
      // TODO: connect API call here
    } else {
      alert("Please upload a file first!");
    }
  };

  return (
    <>
      <NavBarSide />
      <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900">
        Submit Letter of Approval
      </h1>

      <div className="flex justify-center items-center p-6">
        <div className="bg-white rounded-3xl shadow-lg border border-blue-200 p-6 w-full max-w-3xl">
          <h2 className="text-center font-semibold text-blue-900 mb-6">
            Details
          </h2>

          {/* Document Icon */}
          <div className="flex justify-center my-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="300"
              height="360"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-blue-900"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center px-6 mt-6">
            <div className="flex flex-col items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-900 text-white px-5 py-2 rounded-full shadow-md hover:bg-blue-800"
              >
                Upload
              </button>
              {message && (
                <p className="text-xs text-gray-600 mt-2">{message}</p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-600"
              >
                Submit
              </button>
              {file && <p className="text-xs text-gray-600 mt-2">{file.name}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-lg w-96 overflow-hidden">
      
      {/* Header */}
      <div
        className="flex justify-between items-center 
          bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
          text-white px-4 py-2"
      >
        <h2 className="text-sm font-bold">Upload</h2>
        <button
          onClick={() => setIsModalOpen(false)}
          className="text-white hover:text-gray-200 text-lg"
        >
          ✖
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mb-4"
        />
      </div>
    </div>
  </div>
)}
    </>
  );
}
