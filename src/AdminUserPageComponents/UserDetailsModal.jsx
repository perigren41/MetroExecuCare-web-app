import React from "react";

export default function UserDetailsModal({ user, onClose, onEdit, onDelete }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-lg font-bold text-blue-900 mb-4">
          Employee Details
        </h2>

        {/* Profile info */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full border shadow"
          />
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-600">Employee ID: {user.id}</p>
            <p className="text-sm text-gray-600">{user.position}</p>
          </div>
        </div>

        {/* Extra info */}
        <div className="text-sm text-gray-800 space-y-2">
          <p>
            <strong>Email Address:</strong> {user.email || "n/a"}
          </p>
          <p>
            <strong>Contact Number:</strong> {user.contact || "n/a"}
          </p>
          <p>
            <strong>Department:</strong> {user.department || "n/a"}
          </p>
          <p>
            <strong>Birth Date:</strong> {user.birthDate || "n/a"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => onEdit(user)}
            className="bg-blue-700 text-white px-4 py-2 rounded-full hover:bg-blue-800 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(user)}
            className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
