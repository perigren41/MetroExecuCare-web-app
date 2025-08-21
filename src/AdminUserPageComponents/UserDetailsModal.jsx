import React, { useState } from "react";

export default function UserDetailsModal({ user, onClose, onDelete }) {
  if (!user) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Bruce Wayne",
    employeeId: "000001",
    position: "Senior Executive Officer",
    branch: "Gotham Main",
    role: "Admin",
    email: "wayne.bruce@metrobank.com.ph",
    contact: "09987654321",
    department: "Finance",
    birthDate: "1970-02-19",
    password: "123456",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center 
            bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
            text-white px-4 py-1 rounded-t-lg">
          <h2 className="text-sm font-bold">Employee Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-lg"
          >
            ✖
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-[99px_1fr] gap-4 p-5 text-left">
          
          {/* Left Column → Profile Picture */}
         
<div className="row-span-2 flex justify-center">
  <div className="relative w-24 h-24 items-center items-center">
    {/* Circle Image */}
    <img
      src={formData.profileImage || "https://i.pinimg.com/474x/ab/f0/2a/abf02a7cc8f2dd5c00865167583515c5.jpg"}
      alt=""
      className="w-24 h-24 rounded-full object-cover border"
    />

    {/* Hidden file input for profile image */}
    <input
      type="file"
      accept="image/*"
      id="profileImageInput"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () =>
            setFormData({ ...formData, profileImage: reader.result });
          reader.readAsDataURL(file);
        }
      }}
    />

    {/* Clickable SVG overlay when editing */}
    {isEditing && (
      <button
        onClick={() => document.getElementById("profileImageInput").click()}
        className="absolute top-0 left-0 w-24 h-24 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
          />
        </svg>
      </button>
    )}

        {/* Default SVG (not editing) */}
        {!isEditing && !formData.profileImage && (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="absolute top-1/2 left-1/2 w-8 h-8 text-blue-500 -translate-x-1/2 -translate-y-1/2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
        </svg>
      )}
        
  </div>
</div>


          {/* Right Column → Top Info */}
      <div className="grid grid-cols-[110px_1fr] gap-y-0 text-xs text-blue-900">
        <span className="font-bold text-base">Bruce Wayne</span> <span className="font-semibold"></span>

            <span className="font-bold">Employee ID:</span>
            {isEditing ? (
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              />
            ) : (
              <span>{formData.employeeId}</span>
            )}

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

            <span className="font-bold">Branch:</span>
            {isEditing ? (
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              />
            ) : (
              <span>{formData.branch}</span>
            )}

            <span className="font-bold">Role:</span>
            {isEditing ? (
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border px-1 text-xs w-full rounded-sm"
              />
            ) : (
              <span>{formData.role}</span>
            )}
          </div>


          {/* Right Column → Bottom Info */}
          <div className="col-span-2 grid grid-cols-[110px_1fr] gap-y-1 text-blue-900 text-xs mt-1">
            {[
              { label: "Email Address", key: "email" },
              { label: "Contact Number", key: "contact" },
              { label: "Department", key: "department" },
              { label: "Birth Date", key: "birthDate", type: "date" },
              { label: "Password", key: "password" },
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
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-1 w-15 h-6 rounded-full bg-blue-700 text-white text-xs hover:bg-blue-800"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 w-15 h-6 rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
