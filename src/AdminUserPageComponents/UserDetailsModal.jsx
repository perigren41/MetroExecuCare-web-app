import React, { useState, useEffect } from "react";
import cameraIcon from "@/assets/cameraiconwhite.svg";

export default function UserDetailsModal({ user, onClose, onDelete, onUpdate }) {
  if (!user) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Update formData whenever a new user is selected
  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // Save confirmation
  const handleSave = () => {
    setShowConfirmSave(true);
  };
  const confirmSave = () => {
    onUpdate({ ...formData });
    setIsEditing(false);
    setShowConfirmSave(false);
  };
  

  // Delete confirmation
  const handleDelete = () => {
    setShowConfirmDelete(true);
  };
  const confirmDelete = () => {
    onDelete(user.id);
    setShowConfirmDelete(false);
  };

  const newLocal = <span>{formData.id}</span>;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-120 relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white px-4 py-1 rounded-t-lg">
          <h2 className="text-sm font-bold">Employee Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-lg"
          >
            ✖
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-[300_800px] gap-2 p-5 text-left">
          {/* Left Column → Avatar */}
          <div className="row-span-2 flex justify-center">
            <div className="relative w-30 h-30 items-center">
              <img
                src={formData.profileImage || "https://i.pravatar.cc/100?img=68"}
                alt="Profile"
                className="w-30 h-30 rounded-full object-cover border"
              />

              <input
                type="file"
                accept="image/*"
                id="profileImageInput"
                className="hidden"
                onChange={handleImageChange}
              />

              {isEditing && (
                <button
                  onClick={() =>
                    document.getElementById("profileImageInput").click()
                  }
                  className="absolute top-0 left-0 w-30 h-30 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50"
                >
                  <img src={cameraIcon} alt="Camera Icon" className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column → Top Info */}
          <div className="text-xs text-blue-900">
            <div className="font-bold text-base">{formData.name}</div>
          </div>

          <div className="grid grid-cols-[110px_1fr] text-xs text-blue-900">

            <span className="font-bold">Employee ID:</span>
            <span className="text-red-600">{formData.employeeid}</span>

            <span className="font-bold">Role:</span>
            <span className="text-red-600">{formData.role}</span>

            <span className="font-bold">Position:</span>
            {isEditing ? (
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              />
            ) : (
              <span>{formData.position}</span>
            )}

            <span className="font-bold">Department:</span>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              />
            ) : (
              <span>{formData.department}</span>
            )}

            <span className="font-bold">Branch:</span>
            {isEditing ? (
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              >
                <option value="">Select Branch</option>
                <option value="Metrobank Fort - Mckinley Branch">
                  Metrobank Fort - Mckinley Branch
                </option>
                <option value="Metrobank Fort - Ecoprime Tower">
                  Metrobank Fort - Ecoprime Tower
                </option>
                <option value="Metrobank Taguig - Puregold Branch">
                  Metrobank Taguig - Puregold Branch
                </option>
                <option value="Metrobank Taguig - Vista Mall">
                  Metrobank Fort-Ten West Campus Branch
                </option>
                <option value="Metrobank Fort - Bayani Road Branch">
                  Metrobank Fort - Bayani Road Branch
                </option>
              </select>
            ) : (
              <span>{formData.branch}</span>
            )}

            <span className="font-bold">Date Added:</span>
            <span>{formData.created_at}</span>
          </div>

          {/* Right Column → Bottom Info */}
          <div className="col-span-2 grid grid-cols-[110px_1fr] text-blue-900 text-xs mt-3 pl-5">
            {[
              { label: "Email Address", key: "email" },
              { label: "Contact Number", key: "contact_number" },
              { label: "Birth Date", key: "birthDate", type: "date" },
            ].map(({ label, key, type }) => (
              <React.Fragment key={key}>
                <span className="font-bold">{label}:</span>
                {isEditing ? (
                  <input
                    type={type || "text"}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="border px-1 text-xs w-full rounded-sm"
                  />
                ) : (
                  <span>{formData[key]}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-0 mb-4 mx-4">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-4 py-1 w-15 h-6 rounded-full bg-green-600 text-white text-xs hover:bg-green-700"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-1 w-15 h-6 rounded-full bg-blue-700 text-white text-xs hover:bg-blue-800"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-2 py-1 w-15 h-6 rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Save Confirm Modal */}
      {showConfirmSave && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-60">
            <h2 className="text-sm font-bold text-blue-900 mb-3">
              Save this changes?
            </h2>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmSave}
                className="px-4 py-1 rounded-full bg-green-600 text-white text-xs hover:bg-green-700"
              >
                Yes, Save it
              </button>
              <button
                onClick={() => setShowConfirmSave(false)}
                className="px-4 py-1 rounded-full bg-gray-400 text-white text-xs hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-72">
            <h2 className="text-sm font-bold text-red-700 mb-3">
              Are you sure you want to delete this User?
            </h2>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmDelete}
                className="px-4 py-1 rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
              >
                Yes, Delete it
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-1 rounded-full bg-gray-400 text-white text-xs hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}