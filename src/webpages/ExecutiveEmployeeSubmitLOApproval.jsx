import React, { useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";

export default function SubmitLetterOfApproval() {
  const [formData, setFormData] = useState({
    hospital_id: "",
    preferred_date: "",
    address: "",
    contact_number: "",
    reason_request: "",
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    console.log("Submitting:", formData, uploadedFile);
    setShowModal(false);
    // TODO: API call → insert into checkup_requests + request_files
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
      <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-[#00539F]/30 p-8 
        border border-gray-200 
        outline outline-2 outline-[#00539F]">
          <h2 className="text-lg font-semibold text-center text-blue-900 mb-6">
            Details
          </h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side: Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-blue-900 font-medium">
                  Preferred hospital:
                </label>
                <input
                  type="text"
                  name="hospital_id"
                  value={formData.hospital_id}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter hospital ID or name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-blue-900 font-medium">
                  Preferred date of checkup:
                </label>
                <input
                  type="date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-blue-900 font-medium">
                  Address of preferred hospital:
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-blue-900 font-medium">
                  Contact of preferred hospital:
                </label>
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-blue-900 font-medium">
                  Reason of request:
                </label>
                <textarea
                  name="reason_request"
                  value={formData.reason_request}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                />
              </div>
            </div>

            {/* Right Side: File Upload */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-500 rounded-lg p-6">
              <FileText className="w-16 h-16 text-blue-700 mb-4" />
              <label className="cursor-pointer">
                <span className="bg-blue-800 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-900">
                  Upload
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedFile && (
                <p className="mt-3 text-sm text-gray-700">
                  {uploadedFile.name} successfully uploaded!
                </p>
              )}
            </div>
          </form>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 shadow-lg"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-900 p-4 rounded-full">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900">
                  Submit Letter of Authorization
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to <span className="font-semibold">submit</span> this request? Once submitted, it will be forwarded for review and <span className="font-semibold">cannot be edited</span>.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full bg-blue-900 text-white hover:bg-blue-800"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
